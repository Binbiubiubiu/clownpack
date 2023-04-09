import { transform } from "@babel/core";
import { getAliasFromTsconfig } from "@clownpack/helper";
import type { IBuildOptions } from "../types";
import { DFEAULT_RESOLVE_EXTENSIONS } from "../constants";

export default function babelTransformer(this: IBuildOptions, content: string) {
  const presetOptions = {
    presetEnv: {},
    // presetReact: {},
    presetTypeScript: {},
    pluginTransformRuntime: {},
  };
  // use @babel/runtime in workspace
  if (this.pkg?.dependencies?.["@babel/runtime"]) {
    presetOptions.pluginTransformRuntime = {
      absoluteRuntime: false,
      version: this.pkg.dependencies?.["@babel/runtime"],
    };
  }

  const ret = transform(content, {
    cwd: this.cwd,
    sourceType: "unambiguous",
    configFile: false,
    babelrc: false,
    browserslistConfigFile: false,
    sourceMaps: this.sourcemap,
    // TODO: ???
    // sourceFileName: 是否需要设置
    targets: this.targets,
    // assumptions: {
    //   setPublicClassFields: true,
    //   privateFieldsAsProperties: true,
    // },
    presets: [
      [require.resolve("@clownpack/babel-preset"), presetOptions],
      ...(this.extraBabelPresets || []),
    ],
    plugins: [
      [require.resolve("babel-plugin-transform-define"), this.define ?? {}],
      [
        require.resolve("babel-plugin-module-resolver"),
        {
          cwd: this.cwd,
          extensions: this.cwd ?? DFEAULT_RESOLVE_EXTENSIONS,
          alias: { ...getAliasFromTsconfig(this.cwd), ...this.alias },
        },
      ],
      ...(this.extraBabelPlugins || []),
    ],
    ...this.transpilerOptions,
  });

  return {
    code: ret?.code || "",
    map: ret?.map,
  };
}
