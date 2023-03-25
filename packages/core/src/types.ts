import { PluginAPI } from "./pluginAPI";
import type { Service } from "./service";

export enum ServiceStage {
  uninitialized,
  init,
  initPlugins,
  resolveConfig,
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

export interface IPluginAPI<T extends IConfiguration = IConfiguration>
  extends Pick<
    PluginAPI,
    "register" | "registerCommand" | "registerMethod" | "addPluginOptsSchema"
  > {
  cwd: typeof Service.prototype.cwd;
  env: typeof Service.prototype.env;
  subcommand: typeof Service.prototype.subcommand;
  args: typeof Service.prototype.args;
  userConfig: T;
  config: T;
  pkg: typeof Service.prototype.pkg;
  pkgPath: typeof Service.prototype.pkgPath;
  ServiceStage: ServiceStage;
  service: Service<T>;
  registerPlugins(plugins: PluginItem[]): void;
  onStart: IEvent<null>;
  modifyConfig: IModify<T, null>;
}

export interface IConfiguration {
  plugins?: PluginItem[];
}
