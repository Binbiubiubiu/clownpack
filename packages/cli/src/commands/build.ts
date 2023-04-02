import { importLazy } from "@clownpack/helper";
import { Env, IApi, OutputModule } from "../types";

export default (api: IApi) => {
  api.registerCommand({
    name: "build",
    alias: ["b"],
    description: "Build the current package",
    apply: () => {
      const SUPPOTR_MODULE = {
        umd: "umd",
        cjs: "commonjs-static",
        esm: "module",
      };

      importLazy<typeof import("@clownpack/webpack")>("@clownpack/webpack", { cwd: api.cwd }).then(
        (executor) => {
          const { input, clean, name = api.pkg.name, module } = api.config;
          if (!(module in SUPPOTR_MODULE)) {
            throw new Error(`module ${module} is not supported`);
          }
          const entry = typeof input === "string" ? { main: input } : input;
          executor.build({
            name,
            entry,
            cwd: api.cwd,
            env: api.env as `${Env}`,
            clean,
            chainWebpack: async (config) => {
              config.output.library({
                type: SUPPOTR_MODULE[module],
                umdNamedDefine: true,
                ...(module === OutputModule.umd ? { name } : {}),
              });

              // config.target("node16");

              config.experiments({
                outputModule: module === OutputModule.esm,
              });
            },
          });
        },
      );
    },
  });
};
