import { IOptions } from "./types";
import { getCorejsVersion, getDepVersion, pkgPath } from "./utils";

export default (_: any, opts: IOptions) => {
  return {
    presets: [
      [
        require.resolve("@babel/preset-env"),
        {
          bugfixes: true,
          spec: false,
          loose: false,
          modules: false,
          debug: false,
          forceAllTransforms: false,
          ignoreBrowserslistConfig: true,
          useBuiltIns: "entry",
          corejs: getCorejsVersion(),
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
          version: getDepVersion("@babel/runtime"),
          ...opts.pluginTransformRuntime,
        },
      ],
    ].filter(Boolean),
  };
};
