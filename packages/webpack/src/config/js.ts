import Config from "webpack-5-chain";
import type { IBuildOptions } from "../types";
import { getBabelTargets } from "../utils";

export { useJs };

function useJs(config: Config, opts: IBuildOptions) {
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
    rule
      .use("babel-loader")
      .loader(require.resolve("babel-loader"))
      .options({
        sourceType: "unambiguous",
        configFile: false,
        babelrc: false,
        cacheDirectory: false,
        browserslistConfigFile: false,
        targets: getBabelTargets(opts),
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
      });
  }
}
