import joi from "joi";
import { PluginAPI } from "./pluginAPI";
import type { Service } from "./service";

export enum ServiceStage {
  uninitialized,
  init,
  initPlugins,
  resolveConfig,
  collectAppData,
  onCheck,
  onStart,
  runCommand,
}

export enum ApplyPluginsType {
  add = "add",
  modify = "modify",
  event = "event",
}

export type Func = (...args: any[]) => any;
export type PluginItem = string | [string, Record<string, any>];

export interface IPlugin {
  // the plugin's name in the userConfig
  name: string;
  // absolute path
  id: string;
  options: Record<string, any>;
  apply: () => (api: PluginAPI) => { plugins: PluginItem[] } | void;
}

export interface IHook {
  name: string;
  apply: Func;
  pluginId: string;
  stage?: number;
  before?: string;
}

export interface ICommand {
  name: string;
  apply: Func;
  alias?: string | string[];
  description?: string;
  options?: Record<string, string>;
  examples?: string[];
  pluginId: string;
  isAlias?: boolean;
}

export interface IEvent<T> {
  (fn: { (args: T): void }): void;
  (args: {
    fn: { (args: T): void };
    name?: string;
    before?: string | string[];
    stage?: number;
  }): void;
}

export interface IModify<T, U> {
  (fn: { (initialValue: T, args: U): T }): void;
  (fn: { (initialValue: T, args: U): Promise<T> }): void;
  (args: {
    fn: { (initialValue: T, args: U): T };
    name?: string;
    before?: string | string[];
    stage?: number;
  }): void;
  (args: {
    fn: { (initialValue: T, args: U): Promise<T> };
    name?: string;
    before?: string | string[];
    stage?: number;
  }): void;
}

export interface IAdd<T, U> {
  (fn: { (args: T): U | U[] }): void;
  (fn: { (args: T): Promise<U | U[]> }): void;
  (args: {
    fn: { (args: T): U | U[] };
    name?: string;
    before?: string | string[];
    stage?: number;
  }): void;
  (args: {
    fn: {
      (args: T): Promise<U | U[]>;
      name?: string;
      before?: string | string[];
      stage?: number;
    };
  }): void;
}

export type PluginOptsSchemaValidateFn = (joi: joi.Root) => joi.Schema;
export interface IApi {
  cwd: typeof Service.prototype.cwd;
  env: typeof Service.prototype.env;
  subcommand: typeof Service.prototype.subcommand;
  args: typeof Service.prototype.args;
  userConfig: typeof Service.prototype.userConfig;
  service: Service;
  register: typeof PluginAPI.prototype.register;
  registerMethod: typeof PluginAPI.prototype.registerMethod;
  registerPlugins(plugins: Parameters<typeof PluginAPI.prototype.registerPlugins>[1]): void;
  registerCommand: typeof PluginAPI.prototype.registerCommand;
  addPluginOptsSchema: typeof PluginAPI.prototype.addPluginOptsSchema;
  onStart: IEvent<null>;
  modifyConfig: IModify<typeof Service.prototype.config, null>;
}
