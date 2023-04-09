import type { IConfiguration, IPluginAPI } from "@clownpack/core";

/**
 * webpack 插件
 * @public
 */
export default function bundlerWebpackPlugin(api: IPluginAPI<IConfiguration>) {
  // ["chainWebpack", "modifyWebpackConfig"].forEach((name) => {
  //   api.registerMethod({
  //     name,
  //   });
  // });
}

export { build } from "./build";
export * from "./types";
