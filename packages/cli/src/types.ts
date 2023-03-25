import type { PluginItem, IPluginAPI, IConfiguration } from "@clownpack/core";

export enum Env {
  development = "development",
  production = "production",
  test = "test",
}

export interface Configuration extends IConfiguration {
  plugins?: PluginItem[];
}

export interface IApi extends IPluginAPI<Configuration> {
  executor: string;
}
