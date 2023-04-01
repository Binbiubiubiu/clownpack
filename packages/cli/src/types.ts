import type { IPluginAPI, IConfiguration } from "@clownpack/core";

export { Env };
export type { Configuration, IApi };

enum Env {
  development = "development",
  production = "production",
}

interface Configuration extends IConfiguration {
  // input: string;
  // outDir: string;
  // target: string;

  executor: string;
}

// rome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface IApi extends IPluginAPI<Configuration> {}
