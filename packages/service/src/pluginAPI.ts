import assert from "assert";
import joi from "joi";

import {
  createEsbuildRegister,
  getModuleAbsPath,
  getModuleDefaultExport,
  colorette,
} from "@clownpack/helper";
import type { Service } from "./service";
import {
  IPlugin,
  PluginItem,
  ICommand,
  IHook,
  PluginOptsSchemaValidateFn,
  Func,
  ServiceStage,
} from "./types";

interface IPluginAPIOptions {
  plugin: IPlugin;
  service: Service;
}

export class PluginAPI {
  service: Service;
  plugin: IPlugin;
  optsSchema: PluginOptsSchemaValidateFn | null = null;
  constructor(options: IPluginAPIOptions) {
    this.service = options.service;
    this.plugin = options.plugin;
  }

  register(hook: Omit<IHook, "pluginId">) {
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
      pluginId: this.plugin.id,
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
    delete cmd.alias;
    this.service.commands[cmd.name] = {
      ...cmd,
      pluginId: this.plugin.id,
    };
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
        function (this: PluginAPI, applyFn: Func) {
          this.register({
            name: opts.name,
            apply: applyFn,
          });
        },
    );
  }

  addPluginOptsSchema(fn: PluginOptsSchemaValidateFn) {
    this.optsSchema = fn;
  }

  proxy(opts: {
    serviceProps: string[];
    extraProps: Record<string, any>;
  }) {
    return new Proxy(this, {
      get: (target, key: string, receiver) => {
        const methods = this.service.methods[key];
        if (methods) {
          if (Array.isArray(methods)) {
            return (...args: any[]) => {
              methods.forEach((cb) => {
                cb.apply(this, args);
              });
            };
          }
          return methods;
        }

        if (opts.serviceProps.includes(key) && key in this.service) {
          return Reflect.get(this.service, key);
        }

        if (opts.extraProps[key]) {
          return opts.extraProps[key];
        }

        return Reflect.get(target, key, receiver);
      },
    });
  }

  static getPresetOrPluginMap(items: PluginItem[]) {
    let map: Record<string, any> = {};
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
            throw new Error(`Register plugin ${name} failed, since ${e.message}`, {
              cause: e,
            });
          } finally {
            unregister();
          }
        },
      };
    });
  }

  static checkPluginOpts(plugin: IPlugin, fn: PluginOptsSchemaValidateFn) {
    const schema = fn(joi);
    if (schema) {
      assert(
        joi.isSchema(schema),
        `The schema configuration of the plugin ${colorette.redBright(plugin.name)} is incorrect.`,
      );
      const { error } = schema.validate(plugin.options);
      assert(!error, `Incorrect options for the plugin ${colorette.redBright(plugin.name)}`);
    }
  }
}
