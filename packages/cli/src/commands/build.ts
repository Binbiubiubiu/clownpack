import { IApi } from "../types";
import { importLazy } from "@clownpack/helper";
import { IExecutor } from "@clownpack/core";

export default (api: IApi) => {
  api.registerCommand({
    name: "build",
    alias: ["b"],
    description: "Build the current package",
    apply: () => {
      importLazy<IExecutor<any>>(`@clownpack/${api.config.executor}`, { cwd: api.cwd }).then(
        (executor) => {
          executor.build({
            env: api.env,
            cwd: api.cwd,
            userConfig: api.config,
          });
        },
      );
    },
  });
};
