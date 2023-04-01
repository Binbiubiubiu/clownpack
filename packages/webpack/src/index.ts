import type { IPluginAPI } from "@clownpack/core";

export { build } from "./build";

export default function (api: IPluginAPI) {
  ["chainWebpack", "modifyWebpackConfig"].forEach((name) => {
    api.registerMethod({
      name,
    });
  });
}
