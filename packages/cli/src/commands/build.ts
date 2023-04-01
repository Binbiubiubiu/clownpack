import type { Env, IApi } from "../types";
import { importLazy } from "@clownpack/helper";

export default (api: IApi) => {
  api.registerCommand({
    name: "build",
    alias: ["b"],
    description: "Build the current package",
    apply: () => {
      importLazy<typeof import("@clownpack/webpack")>("@clownpack/webpack", { cwd: api.cwd }).then(
        (executor) => {
          executor.build({
            entry: {},
            module: "esm",
            cwd: api.cwd,
            env: api.env as `${Env}`,
            clean: true,
            cache: true,
          });
        },
      );

      // api["build:webpack"]({
      //   env: api.env,
      //   cwd: api.cwd,
      //   userConfig: api.config,
      // });
      // api.applyPlugins({
      //   name: "onWebapckBuild",
      //   args: {
      //     env: api.env,
      //     cwd: api.cwd,
      //     userConfig: api.config,
      //   },
      // });
    },
  });
};
