import type { IPluginAPI, IConfiguration } from "@clownpack/core";

export { Env, OutputModule };
export type { Configuration, IApi };

enum Env {
  development = "development",
  production = "production",
}

enum OutputModule {
  cjs = "cjs",
  esm = "esm",
  umd = "umd",
}

interface Configuration extends IConfiguration {
  // input: string;
  // outDir: string;
  // target: string;
  input: string | { [key: string]: string };
  module: `${OutputModule}`;
  outDir?: string;
  browerslist?: string | string[]; //| { [key: string]: any };
  name?: string;
  clean?: boolean;
}

// rome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface IApi extends IPluginAPI<Configuration> {}
