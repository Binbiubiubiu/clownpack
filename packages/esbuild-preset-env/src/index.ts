import type { Plugin } from "esbuild";
import type { IOptions } from "./types";
import { getEsbuildTargets } from "./helper";

function esbuildPresetEnv(opts: IOptions = {}): Plugin {
  return {
    name: "esbuild-preset-env",
    setup(build) {
      const infos = getEsbuildTargets(opts);
      const config = build.initialOptions;
      config.platform = infos.platform;
      config.target = infos.target;
    },
  };
}

export = esbuildPresetEnv;
