import { AsyncSeriesWaterfallHook } from "tapable";
import path from "path";
import assert from "assert";
import { type IPkg, colorette, type yParser } from "@clownpack/helper";
import { loadEnv } from "./utils";
import {
  ApplyPluginsType,
  ServiceStage,
  type PluginItem,
  type IPlugin,
  type ICommand,
  type IHook,
  type IConfiguration,
  type IPluginAPI,
} from "./types";
import { DefaultConfigProvider, type IConfigProvider } from "./config";
import { PluginAPI } from "./pluginAPI";
import { DEFAULT_NODE_ENV } from "./constants";

/**
 * @public
 */
export interface IServiceOptions<T> {
  frameworkName: string;
  cwd?: string;
  env?: string;
  configProvider?: IConfigProvider<T>;
  plugins?: PluginItem[];
}

/**
 * @public
 */
export class Service<T extends IConfiguration> {
  readonly cwd: string;
  readonly env: string;
  readonly customEnv: string | undefined;
  command: string = "";
  frameworkName: string = "";
  args: yParser.Arguments = { _: [], $0: "" };
  hooks: Record<string, IHook[]> = {};
  methods: Record<string, Function[]> = {};
  plugins: Record<string, IPlugin> = {};
  commands: Record<string, ICommand> = {};
  userConfig = {} as T;
  config = {} as T;
  skipPluginIds = new Set<string>();
  stage: ServiceStage = ServiceStage.uninitialized;
  configProvider: IConfigProvider<T>;
  pkgPath: string = "";
  pkg: IPkg = {};
  options: IServiceOptions<T>;

  constructor(opts: string | IServiceOptions<T>) {
    if (typeof opts === "string") {
      opts = {
        frameworkName: opts,
      };
    }
    this.options = opts;
    this.cwd = this.options.cwd || process.cwd();
    this.env = this.options.env || DEFAULT_NODE_ENV;
    this.frameworkName = this.options.frameworkName;
    this.customEnv = process.env[`${this.frameworkName}_ENV`.toUpperCase()];
    this.configProvider =
      this.options.configProvider ||
      new DefaultConfigProvider({
        cwd: this.cwd,
        env: this.env,
        customEnv: this.customEnv,
        name: this.frameworkName,
      });

    // load pkg
    this.pkgPath = path.join(this.cwd, "package.json");
    try {
      this.pkg = require(this.pkgPath);
    } catch (e) {}
  }

  async run(options: { command: string; args: yParser.Arguments }) {
    const { command, args } = options;
    args._ ||= [];
    // e.g: remove help command
    if (args._[0] === command) {
      args._.shift();
    }

    this.command = command;
    this.args = args;

    this.stage = ServiceStage.init;
    // load dotEnv
    loadEnv({ cwd: this.cwd, env: this.env, envFile: ".env", customEnv: this.customEnv });

    // load configFile
    this.userConfig = this.configProvider.getUserConfig();

    // load plugins
    const plugins = PluginAPI.resolvePlugins({
      cwd: this.cwd,
      plugins: [
        require.resolve("./preset"),
        ...(this.options.plugins || []),
        ...(this.userConfig.plugins || []),
      ],
    });

    this.stage = ServiceStage.initPlugins;
    while (plugins.length > 0) {
      await this.walkPlugin({
        current: plugins.shift()!,
        plugins,
      });
    }

    const commandImpl = this.commands[this.command];

    assert(
      commandImpl,
      `Invalid command ${colorette.redBright(this.command)}, it's not registered.`,
    );

    this.stage = ServiceStage.resolveConfig;
    this.config = await this.applyPlugins({
      name: "modifyConfig",
      initialValue: this.userConfig,
    });

    this.stage = ServiceStage.onStart;
    await this.applyPlugins({
      name: "onStart",
    });

    this.stage = ServiceStage.runCommand;
    return commandImpl.apply();
  }

  async applyPlugins(opts: {
    name: string;
    initialValue?: any;
    type?: ApplyPluginsType;
    args?: any;
  }) {
    const hooks = this.hooks[opts.name] || [];
    if (!hooks.length) {
      return opts.initialValue;
    }

    let type = opts.type;
    if (!type) {
      if (opts.name.startsWith("on")) {
        type = ApplyPluginsType.event;
      } else if (opts.name.startsWith("add")) {
        type = ApplyPluginsType.add;
      } else if (opts.name.startsWith("modify")) {
        type = ApplyPluginsType.modify;
      } else {
        throw new Error(`Invalid applyPlugins arguments, type must be supplied for ${opts.name}.`);
      }
    }

    switch (type) {
      case ApplyPluginsType.add:
        const addWaterfall = new AsyncSeriesWaterfallHook(["memo"]);
        for (const hook of hooks) {
          if (!this.isPluginEnable(hook)) continue;
          addWaterfall.tapPromise(
            {
              name: hook.plugin.id,
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
          if (!this.isPluginEnable(hook)) continue;
          modifyWaterfall.tapPromise(
            {
              name: hook.plugin.id,
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
          if (!this.isPluginEnable(hook)) continue;
          eventWaterfall.tapPromise(
            {
              name: hook.plugin.id,
              stage: hook.stage || 0,
              before: hook.before,
            },
            async () => {
              await hook.apply(opts.args);
            },
          );
        }
        return eventWaterfall.promise(1);
      default:
        throw new Error(
          `applyPlugins failed, type is not defined or is not matched, got ${opts.type}.`,
        );
    }
  }

  isPluginEnable(hook: IHook | string) {
    let plugin: IPlugin;
    if ((hook as IHook).plugin) {
      plugin = (hook as IHook).plugin;
    } else {
      plugin = this.plugins[hook as string];
      if (!plugin) return false;
    }
    const { id } = plugin;
    if (this.skipPluginIds.has(id)) return false;
    return true;
  }

  private async walkPlugin(opts: {
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
    const proxyAPI = PluginAPI.proxy({
      api,
      service: this,
      serviceProps: [
        "args",
        "applyPlugins",
        "config",
        "cwd",
        "env",
        "command",
        "userConfig",
        "pkg",
        "pkgPath",
        "isPluginEnable",
      ],
      extraProps: {
        ServiceStage,
        service: this,
      },
    }) as unknown as IPluginAPI<IConfiguration>;
    const ret = opts.current.setup.call(opts.current, proxyAPI, opts.current.options);
    if (api.optsSchema) {
      PluginAPI.checkPluginOpts(opts.current, api.optsSchema);
    }
    const needAddPlugins = PluginAPI.resolvePlugins({
      cwd: this.cwd,
      plugins: ret?.plugins,
    });
    if (needAddPlugins.length) {
      opts.plugins.unshift(...needAddPlugins);
    }
  }
}
