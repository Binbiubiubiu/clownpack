import { importLazy } from "@clownpack/helper";
import { ApplyPluginsType } from "@clownpack/core";
import { Env, Module } from "../types";
import { definePlugin } from "../define";

export default definePlugin((api) => {
  api.registerCommand({
    name: "build",
    alias: ["b"],
    description: "Build the current package",
    apply: () => {
      if (api.config.runner === "webpack") {
        const {
          name = api.pkg.name,
          module = "umd",
          input = "src/index.ts",
          ...userConfig
        } = api.config;
        const SUPPOTR_MODULE: Record<`${Module}`, string> = {
          umd: "umd",
          cjs: "commonjs-static",
          esm: "module",
        };

        importLazy<typeof import("@clownpack/webpack")>("@clownpack/webpack", {
          cwd: api.cwd,
        }).then((executor) => {
          if (!(module in SUPPOTR_MODULE)) {
            throw new Error(`module ${module} is not supported`);
          }
          const entry = typeof input === "string" ? { main: input } : input;

          executor
            .build({
              name,
              entry,
              cwd: api.cwd,
              env: api.env as `${Env}`,
              clean: userConfig.clean,
              browserslist: userConfig.browserslist,
              externals: userConfig.externals,
              jsMinifier: false,
              transpiler: "swc",
              chainWebpack: async (config, args) => {
                config.output.library({
                  type: SUPPOTR_MODULE[module],
                  umdNamedDefine: true,
                  ...(module === Module.umd && { name }),
                });

                config.experiments({
                  outputModule: module === Module.esm,
                });

                await userConfig.chainWebpack?.(config, args);

                await api.applyPlugins({
                  name: "chainWebpack",
                  type: ApplyPluginsType.modify,
                  initialValue: config,
                  args,
                });
              },
              modifyWebpackConfig: async (config, args) => {
                if (userConfig.modifyWebpackConfig) {
                  config = await userConfig.modifyWebpackConfig(config, args);
                }

                return (
                  (await api.applyPlugins({
                    name: "modifyWebpackConfig",
                    initialValue: config,
                    args,
                  })) ?? config
                );
              },
            })
            .catch(() => {});
        });
      }
    },
  });
});
