import type { PluginItem, IPluginAPI, IConfiguration } from "@clownpack/core";

export { Configuration, IApi };

interface Configuration extends IConfiguration {
  extends?: string;

  executor: string;
}

interface IApi extends IPluginAPI<Configuration> {}
