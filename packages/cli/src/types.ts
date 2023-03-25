import type { PluginItem, IApi as IBaseApi } from "@clownpack/service";

export enum Env {
  development = "development",
  production = "production",
  test = "test",
}

export interface IClownConfig {
  plugins?: PluginItem[];
}

export interface IApi extends IBaseApi {}
