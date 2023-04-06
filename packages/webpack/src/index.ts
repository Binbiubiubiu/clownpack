import type { IConfiguration, IPluginAPI } from "@clownpack/core";

/**
 * webpack 插件
 * @public
 */
export default function webpackPlugin(api: IPluginAPI<IConfiguration>) {
  ["chainWebpack", "modifyWebpackConfig"].forEach((name) => {
    api.registerMethod({
      name,
    });
  });
}

export { build } from "./build";
export type { IPluginAPI, IConfiguration, IBuildOptions } from "./types";
export { Env, Transpiler, JSMinifier, CSSMinifier } from "./types";
