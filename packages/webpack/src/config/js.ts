import Config from "webpack-5-chain";
import { getEsbuildTargets } from "@clownpack/esbuild-preset-env";
import { IBuildOptions, Transpiler } from "../types";

export { useJs };

function useJs(config: Config, opts: IBuildOptions) {
  opts.transpiler ??= Transpiler.babel;

  const srcRules = [
    config.module
      .rule("src")
      .test(/\.(js|mjs|cjs)$/)
      .include.add(opts.cwd)
      .end()
      .exclude.add(/node_modules/)
      .end(),
    config.module.rule("jsx").test(/\.(jsx|ts|tsx)$/),
  ];

  for (const rule of srcRules) {
    rule.resolve.fullySpecified(false);
    if (opts.transpiler === Transpiler.babel) {
      rule
        .use("babel-loader")
        .loader(require.resolve("babel-loader"))
        .options({
          sourceType: "unambiguous",
          configFile: false,
          babelrc: false,
          cacheDirectory: false,
          browserslistConfigFile: false,
          ...(opts.browserslist && {
            targets: opts.browserslist, // getBabelTargets(opts),
          }),
          // assumptions: {
          //   setPublicClassFields: true,
          //   privateFieldsAsProperties: true,
          // },
          presets: [
            [
              require.resolve("@clownpack/babel-preset"),
              {
                presetEnv: {},
                presetReact: {},
                presetTypeScript: {},
                pluginTransformRuntime: {},
              },
            ],
            ...(opts.extraBabelPresets || []),
          ],
          plugins: opts.extraBabelPlugins || [],
          ...opts.transpilerOptions,
        });
    } else if (opts.transpiler === Transpiler.swc) {
      rule
        .use("swc-loader")
        .loader(require.resolve("@swc-node/loader"))
        .options({
          ...opts.transpilerOptions,
        });
    } else if (opts.transpiler === Transpiler.esbuild) {
      rule
        .use("esbuild-loader")
        .loader(require.resolve("esbuild-loader"))
        .options({
          implementation: require("esbuild"),
          target: getEsbuildTargets({ configPath: opts.cwd }).target,
          ...opts.transpilerOptions,
        });
    } else {
      throw new Error(`Unsupported transpiler ${opts.transpiler}.`);
    }
  }
}
