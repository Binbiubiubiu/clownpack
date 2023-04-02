import assert from "assert";
import zod from "zod";
import path from "path";

import {
  createEsbuildRegister,
  getModuleAbsPath,
  getModuleDefaultExport,
  colorette,
  resolveSync,
} from "@clownpack/helper";

import { fromZodError } from "zod-validation-error";
import type { Service } from "./service";
import {
  type IPlugin,
  type PluginItem,
  type ICommand,
  type IHook,
  type Func,
  ServiceStage,
  ApplyPluginsType,
} from "./types";

interface IPluginAPIOptions {
  plugin: IPlugin;
  service: Service;
}

export class PluginAPI {
  service: Service;
  plugin: IPlugin;
  optsSchema: ((z: typeof zod) => zod.Schema) | null = null;
  constructor(options: IPluginAPIOptions) {
    this.service = options.service;
    this.plugin = options.plugin;
  }

  register(hook: Omit<IHook, "plugin">) {
    assert(
      typeof hook.name === "string",
      `Failed to register the hook ${hook.name} in the plugin ${this.plugin.name}. The name of the hook must be a string`,
    );
    assert(
      typeof hook.apply === "function",
      `Failed to register the hook ${hook.name} in the plugin ${this.plugin.name}. The apply of the hook must be a function`,
    );
    this.service.hooks[hook.name] ||= [];
    this.service.hooks[hook.name].push({
      ...hook,
      plugin: this.plugin,
    });
  }

  registerCommand(cmd: Omit<ICommand, "pluginId">) {
    assert(
      !this.service.commands[cmd.name],
      `${colorette.redBright("registerCommand")} failed, the command ${cmd.name} is exists from ${
        this.plugin.name
      }`,
    );
    let { alias } = cmd;
    this.service.commands[cmd.name] = {
      ...cmd,
      pluginId: this.plugin.id,
    };
    delete cmd.alias;
    if (alias) {
      if (typeof alias === "string") {
        alias = [alias];
      }
      alias.forEach((name) => {
        this.registerCommand({
          ...cmd,
          isAlias: true,
          name,
        });
      });
    }
  }

  registerPlugins(source: IPlugin[], addItems: PluginItem[]) {
    assert(
      this.service.stage === ServiceStage.initPlugins,
      `${colorette.redBright(
        "registerPlugins",
      )} failed, it should only be used in registering stage.`,
    );
    const plugins = PluginAPI.resolvePlugins({
      cwd: this.service.cwd,
      plugins: addItems,
    });
    source.splice(0, 0, ...plugins);
  }

  registerMethod(opts: { name: string; fn?: Func }) {
    assert(
      typeof opts.name === "string",
      `${colorette.redBright("registerMethod")} failed, name must be string`,
    );
    assert(
      opts.name.length > 0,
      `${colorette.redBright("registerMethod")} failed, name must not be empty`,
    );
    this.service.methods[opts.name] ||= [];
    this.service.methods[opts.name].push(
      opts.fn ||
        function (this: PluginAPI, apply: Func) {
          this.register({
            name: opts.name,
            apply,
          });
        },
    );
  }

  addPluginOptsSchema(generator: typeof PluginAPI.prototype.optsSchema) {
    this.optsSchema = generator;
  }

  skipPlugins(keys: string[]) {
    for (const oldKey of keys) {
      let key = oldKey;
      if (!path.isAbsolute(key)) {
        try {
          key = resolveSync(key, { basedir: this.service.cwd });
        } catch {}
      }
      assert(this.plugin.id === key, `plugin ${oldKey} can't skip itself!`);
      this.service.skipPluginIds.add(key);
    }
  }

  static proxy(opts: {
    api: PluginAPI;
    service: Service;
    serviceProps: string[];
    extraProps: Record<string, any>;
  }) {
    return new Proxy(opts.api, {
      get(target, key: string, receiver) {
        const methods = opts.service.methods[key];
        if (methods) {
          if (Array.isArray(methods)) {
            return (...args: any[]) => {
              methods.forEach((cb) => {
                cb.apply(target, args);
              });
            };
          }
          return methods;
        }

        if (opts.serviceProps.includes(key) && key in opts.service) {
          return Reflect.get(opts.service, key);
        }

        if (opts.extraProps[key]) {
          return opts.extraProps[key];
        }

        return Reflect.get(target, key, receiver);
      },
    });
  }

  static getPresetOrPluginMap(items: PluginItem[]) {
    const map: Record<string, any> = {};
    if (Array.isArray(items)) {
      for (const item of items) {
        if (typeof item === "string") {
          const name = item;
          map[name] = null;
        } else if (Array.isArray(item)) {
          const name = getModuleAbsPath(item[0]);
          map[name] = item[1];
        }
      }
    }
    return map;
  }

  static resolvePlugins(opts: {
    cwd: string;
    plugins?: PluginItem[];
  }): IPlugin[] {
    const map = PluginAPI.getPresetOrPluginMap(opts.plugins || []);
    return Object.keys(map).map((name) => {
      const id = getModuleAbsPath({
        name,
        type: "plugin",
        cwd: opts.cwd,
      });
      return <IPlugin>{
        name,
        id,
        options: map[name],
        apply: () => {
          const unregister = createEsbuildRegister({
            hookMatcher: (fileName) => fileName === id,
          });
          try {
            return getModuleDefaultExport(require(id));
          } catch (e: any) {
            throw new Error(`Register plugin ${name} failed, since ${e.message}`);
          } finally {
            unregister();
          }
        },
      };
    });
  }

  static checkPluginOpts(plugin: IPlugin, generator: typeof PluginAPI.prototype.optsSchema) {
    const schema = generator?.(zod);
    if (schema) {
      assert(
        isZodSchema(schema),
        `The schema configuration of the plugin ${colorette.redBright(plugin.name)} is incorrect.`,
      );
      const output = schema.safeParse(plugin.options);
      if (!output.success) {
        console.log(
          `Incorrect options for the plugin ${colorette.redBright(plugin.name)}.\n${fromZodError(
            output.error,
          )}`,
        );
        process.exit(1);
      }
    }
  }
}

const isZodSchema = async (schema: any) => {
  try {
    return "safeParse" in schema;
  } catch (_) {
    return false;
  }
};
