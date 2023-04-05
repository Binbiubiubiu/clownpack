import { importLazy } from "@clownpack/helper";
import { ApplyPluginsType } from "@clownpack/core";
import { Env, Format } from "../types";
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
          format = "umd",
          input = "src/index.ts",
          ...userConfig
        } = api.config;
        const SUPPOTR_FORMAT = {
          umd: "umd",
          cjs: "commonjs-static",
          esm: "module",
        };

        importLazy<typeof import("@clownpack/webpack")>("@clownpack/webpack", {
          cwd: api.cwd,
        }).then((executor) => {
          if (!(format in SUPPOTR_FORMAT)) {
            throw new Error(`module ${format} is not supported`);
          }
          const entry = typeof input === "string" ? { main: input } : input;

          console.log("build..");
          executor
            .build({
              name,
              entry,
              cwd: api.cwd,
              env: api.env as `${Env}`,
              clean: userConfig.clean,
              browserslist: userConfig.browserslist,
              externals: userConfig.externals,
              esModule: format === Format.esm,
              jsMinifier: false,
              // transpiler: "swc",
              chainWebpack: async (config, args) => {
                config.output.library({
                  type: SUPPOTR_FORMAT[format],
                  umdNamedDefine: true,
                  ...(format === Format.umd && { name }),
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
            .catch(console.log);
        });
      }
    },
  });
});
