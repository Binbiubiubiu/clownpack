import { IOptions } from "./types";
import { getCorejsVersion, getRuntimeVersion, pkgPath } from "./utils";

export default (_: any, opts: IOptions) => {
  return {
    presets: [
      [
        require.resolve("@babel/preset-env"),
        {
          bugfixes: true,
          loose: false,
          modules: false,
          useBuiltIns: "entry",
          corejs: getCorejsVersion(),
          ignoreBrowserslistConfig: true,
          ...opts.presetEnv,
        },
      ],
      [
        require.resolve("@babel/preset-react"),
        {
          runtime: "automatic",
          development: process.env.NODE_ENV === "development",
          ...opts.presetReact,
        },
      ],
      [
        require.resolve("@babel/preset-typescript"),
        {
          allowDeclareFields: true,
          allowNamespaces: true,
          onlyRemoveTypeImports: false,
          optimizeConstEnums: true,
          ...opts.presetTypescript,
        },
      ],
    ],
    plugins: [
      opts.pluginTransformRuntime && [
        require.resolve("@babel/plugin-transform-runtime"),
        {
          corejs: false,
          helpers: true,
          regenerator: true,
          absoluteRuntime: pkgPath,
          version: getRuntimeVersion(),
          ...opts.pluginTransformRuntime,
        },
      ],
    ].filter(Boolean),
  };
};
