import { PluginAPI } from "./pluginAPI";
import type { Service } from "./service";

export { ServiceStage, ApplyPluginsType };
export type {
  Func,
  PluginItem,
  IPlugin,
  IHook,
  ICommand,
  IEvent,
  IModify,
  IAdd,
  IPluginAPI,
  IConfiguration,
};

enum ServiceStage {
  uninitialized,
  init,
  initPlugins,
  resolveConfig,
  onStart,
  runCommand,
}

enum ApplyPluginsType {
  add = "add",
  modify = "modify",
  event = "event",
}

type Func = (...args: any[]) => any;
type PluginItem = string | [string, Record<string, any>];
type PluginApply<Options> = (api: PluginAPI, options: Options) => { plugins: PluginItem[] } | void;

interface IPlugin<Options = Record<string, any>> {
  // the plugin's name in the userConfig
  name: string;
  // absolute path
  id: string;
  options: Options;
  apply: () => PluginApply<Options>;
}

interface IHook {
  name: string;
  apply: Func;
  plugin: IPlugin;
  stage?: number;
  before?: string;
}

interface ICommand {
  name: string;
  apply: Func;
  alias?: string | string[];
  description?: string;
  options?: Record<string, string>;
  examples?: string[];
  pluginId: string;
  isAlias?: boolean;
}

interface IEvent<T> {
  (fn: { (args: T): void }): void;
  (args: {
    fn: { (args: T): void };
    name?: string;
    before?: string | string[];
    stage?: number;
  }): void;
}

interface IModify<T, U> {
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

interface IAdd<T, U> {
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

type NeedProxyPluginAPI =
  | "register"
  | "registerCommand"
  | "registerMethod"
  | "addPluginOptsSchema"
  | "skipPlugins";

interface IPluginAPI<T extends IConfiguration = IConfiguration>
  extends Pick<PluginAPI, NeedProxyPluginAPI> {
  cwd: typeof Service.prototype.cwd;
  env: typeof Service.prototype.env;
  command: typeof Service.prototype.command;
  args: typeof Service.prototype.args;
  userConfig: T;
  config: T;
  pkg: typeof Service.prototype.pkg;
  pkgPath: typeof Service.prototype.pkgPath;
  ServiceStage: ServiceStage;
  service: Service<T>;
  applyPlugins(opts: {
    name: string;
    type?: ApplyPluginsType;
    initialValue?: any;
    args?: any;
  }): Promise<any>;
  registerPlugins(plugins: PluginItem[]): void;
  onStart: IEvent<null>;
  modifyConfig: IModify<T, null>;
}

interface IConfiguration {
  plugins?: PluginItem[];
}
