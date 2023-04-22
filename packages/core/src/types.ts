import type { IAnyObject } from '@clownpack/helper';
import { PluginAPI } from './pluginAPI';
import type { Service } from './service';

/**
 * @public
 */
export enum ServiceStage {
  uninitialized,
  init,
  initPlugins,
  resolveConfig,
  onStart,
  runCommand,
}

/**
 * @public
 */
export enum ApplyPluginsType {
  add = 'add',
  modify = 'modify',
  event = 'event',
}

/**
 * @public
 */
export type Func = (...args: any[]) => any;

/**
 * @public
 */
export type PluginItem = string | [string, IAnyObject];

/**
 * @public
 */
export type PluginSetup<T, Options> = (
  api: T,
  options?: Options
) => {
  plugins: PluginItem[];
} | void;

/**
 * @public
 */
export type PluginDefineOptions<T, E> =
  | {
      name?: string;
      setup: PluginSetup<T, E>;
    }
  | PluginSetup<T, E>;

/**
 * @public
 */
export interface IPlugin<T = IPluginAPI<IConfiguration>, Options = IAnyObject> {
  // the plugin's name in the userConfig
  name: string;
  // absolute path
  id: string;
  options: Options;
  setup: PluginSetup<T, Options>;
}

/**
 * @public
 */
export interface IHook {
  name: string;
  apply: Func;
  plugin: IPlugin;
  stage?: number;
  before?: string;
}

/**
 * @public
 */
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

/**
 * @public
 */
export interface IEvent<T> {
  (fn: { (args: T): void }): void;
  (args: {
    fn: { (args: T): void };
    name?: string;
    before?: string | string[];
    stage?: number;
  }): void;
}

/**
 * @public
 */
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

/**
 * @public
 */
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

/**
 * @public
 */
export interface IPluginAPI<T extends IConfiguration>
  extends Pick<
    PluginAPI,
    'register' | 'registerCommand' | 'registerMethod' | 'addPluginOptsSchema' | 'skipPlugins'
  > {
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

/**
 * @public
 */
export interface IConfiguration {
  plugins?: PluginItem[];
}
