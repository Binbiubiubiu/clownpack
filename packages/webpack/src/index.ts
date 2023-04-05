import type { IConfiguration, IPluginAPI } from "@clownpack/core";

export default function (api: IPluginAPI<IConfiguration>) {
  ["chainWebpack", "modifyWebpackConfig"].forEach((name) => {
    api.registerMethod({
      name,
    });
  });
}

export { build } from "./build";
export type { IPluginAPI, IConfiguration } from "./types";
