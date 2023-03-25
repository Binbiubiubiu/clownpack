import type { yParser } from "@clownpack/helper";
import { AsyncSeriesWaterfallHook } from "tapable";
import { join } from "path";
import assert from "assert";
import { colorette } from "@clownpack/helper";
import { loadEnv } from "./utils";
import { ApplyPluginsType, IPlugin, ServiceStage, type ICommand, type IHook } from "./types";
import { ConfigService } from "./config";
import { PluginAPI } from "./pluginAPI";
import { DEFAULT_FRAMEWORK_NAME } from "./constants";
import { showHelp, showHelps } from "./console";

export { Service };

interface IServiceOptions {
  cwd?: string;
  env?: string;
  frameworkName?: string;
}

class Service {
  readonly cwd: string;
  readonly env: string;
  readonly customEnv: string | undefined;
  subcommand: string = "";
  frameworkName: string = "";
  args: yParser.Arguments = { _: [], $0: "" };
  hooks: Record<string, IHook[]> = {};
  methods: Record<string, Function[]> = {};
  plugins: Record<string, IPlugin> = {};
  commands: Record<string, ICommand> = {};
  userConfig: Record<string, any> = {};
  config: Record<string, any> = {};
  stage: ServiceStage = ServiceStage.uninitialized;
  configService: ConfigService;
  pkgPath: string = "";
  pkg: {
    name?: string;
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    [key: string]: any;
  } = {};

  constructor(options?: IServiceOptions) {
    this.cwd = options?.cwd ?? process.cwd();
    this.env = options?.env ?? process.env.NODE_ENV ?? "production";
    this.frameworkName = options?.frameworkName || DEFAULT_FRAMEWORK_NAME;
    this.customEnv = process.env[`${this.frameworkName}_ENV`.toUpperCase()];
    this.configService = new ConfigService({
      cwd: this.cwd,
      env: this.env,
      customEnv: this.customEnv,
      name: this.frameworkName,
    });

    // load pkg
    this.pkgPath = join(this.cwd, "package.json");
    try {
      this.pkg = require(this.pkgPath);
    } catch (e) {}
  }

  async run(options: { name: string; args: yParser.Arguments }) {
    const { name, args } = options;
    args._ ||= [];
    if (args._[0] === name) {
      args._.shift();
    }
    this.subcommand = options.name;
    this.args = options.args;

    this.stage = ServiceStage.init;
    // load dotEnv
    loadEnv({ cwd: this.cwd, env: this.env, envFile: ".env", customEnv: this.customEnv });

    // load configFile
    this.userConfig = this.configService.getUserConfig();

    // load plugins
    const plugins = PluginAPI.resolvePlugins({
      cwd: this.cwd,
      plugins: this.userConfig.plugins || [],
    });
    this.stage = ServiceStage.initPlugins;
    while (plugins.length) {
      await this.walkPlugin({
        current: plugins.shift()!,
        plugins,
      });
    }

    // some options
    this.printFrameworkInfo();
    if (this.args.version || this.args.v || this.subcommand === "version") {
      return this.printVersion();
    } else if (this.args.help || this.args.h || this.subcommand === "help" || !this.subcommand) {
      this.subcommand = `${this.args._[1] || ""}`;
      return this.printHelp(this.subcommand);
    }

    const command = this.commands[this.subcommand];
    if (!command) {
      throw Error(`Invalid command ${colorette.redBright(this.subcommand)}, it's not registered.`);
    }

    this.stage = ServiceStage.resolveConfig;
    this.config = await this.applyPlugins({
      name: "modifyConfig",
      initialValue: this.configService.getUserConfig(),
    });

    this.stage = ServiceStage.onStart;
    await this.applyPlugins({
      name: "onStart",
    });

    return command.apply({ args });
  }

  async applyPlugins(opts: {
    name: string;
    initialValue?: any;
    args?: any;
  }) {
    const hooks = this.hooks[opts.name] || [];
    if (!hooks.length) {
      return opts.initialValue;
    }

    let type;
    if (opts.name.startsWith("on")) {
      type = ApplyPluginsType.event;
    } else if (opts.name.startsWith("add")) {
      type = ApplyPluginsType.add;
    } else if (opts.name.startsWith("modify")) {
      type = ApplyPluginsType.modify;
    }

    switch (type) {
      case ApplyPluginsType.add:
        const addWaterfall = new AsyncSeriesWaterfallHook(["memo"]);
        for (const hook of hooks) {
          addWaterfall.tapPromise(
            {
              name: hook.pluginId,
              stage: hook.stage || 0,
              before: hook.before,
            },
            async (memo: any) => {
              const res = await hook.apply(opts.args);
              memo.push(res);
              return memo;
            },
          );
        }
        return addWaterfall.promise(opts.initialValue || []);
      case ApplyPluginsType.modify:
        const modifyWaterfall = new AsyncSeriesWaterfallHook(["arg"]);
        for (const hook of hooks) {
          modifyWaterfall.tapPromise(
            {
              name: hook.pluginId,
              stage: hook.stage || 0,
              before: hook.before,
            },
            async (memo: any) => {
              return hook.apply(memo, opts.args);
            },
          );
        }
        return modifyWaterfall.promise(opts.initialValue);
      case ApplyPluginsType.event:
        const eventWaterfall = new AsyncSeriesWaterfallHook(["_"]);
        for (const hook of hooks) {
          eventWaterfall.tapPromise(
            {
              name: hook.pluginId,
              stage: hook.stage || 0,
              before: hook.before,
            },
            async () => {
              await hook.apply(opts.args);
            },
          );
        }
        return eventWaterfall.promise(1);
    }
  }

  async walkPlugin(opts: {
    current: IPlugin;
    plugins: IPlugin[];
  }) {
    assert(
      !this.plugins[opts.current.id],
      `plugin ${colorette.redBright(opts.current.name)} is already registered.`,
    );
    this.plugins[opts.current.id] = opts.current;
    const api = new PluginAPI({
      service: this,
      plugin: opts.current,
    });
    // @ts-ignore
    api.registerPlugins = api.registerPlugins.bind(api, opts.plugins);
    const proxyAPI = api.proxy({
      serviceProps: [
        "cwd",
        "env",
        "subcommand",
        "args",
        "userConfig",
        "config",
        "pkg",
        "pkgPath",
        "applyPlugins",
      ],
      extraProps: {
        ServiceStage,
        service: this,
      },
    });
    const ret = opts.current.apply()(proxyAPI);
    if (api.optsSchema) {
      PluginAPI.checkPluginOpts(opts.current, api.optsSchema);
    }
    const needAddPlugins = PluginAPI.resolvePlugins({
      cwd: this.cwd,
      plugins: ret?.plugins,
    });
    opts.plugins.unshift(...needAddPlugins);
  }

  protected printHelp(subCommand: string) {
    if (subCommand) {
      if (subCommand in this.commands) {
        showHelp.call(this, this.commands[subCommand]);
      } else {
        console.log(`Unknown subcommand ${subCommand}.`);
      }
    } else {
      showHelps.call(this);
    }
  }

  protected printFrameworkInfo() {
    console.log(`${"🤡"} ${colorette.magentaBright(this.frameworkName)} v${this.pkg.version}`);
  }

  protected printVersion() {
    const { version } = this.pkg;
    console.log();
    console.log(version);
    return version;
  }
}
