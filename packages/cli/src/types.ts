import type { IPluginAPI, IConfiguration } from "@clownpack/core";

export type { Configuration, IApi };
export { Env };

enum Env {
  development = "development",
  production = "production",
  test = "test",
}

interface Configuration extends IConfiguration {
  extends?: string;

  executor: string;
}

interface IApi extends IPluginAPI<Configuration> {}
