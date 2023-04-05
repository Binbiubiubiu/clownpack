import { type TsConfigResult, browserslist, getTsconfig } from "@clownpack/helper";
import path from "path";
import { DEFAULT_CACHE_DIRECTORY, SUPPORTED_ESBUILD_TARGETS } from "./constants";
import type { IBuildOptions } from "./types";

export { loadTsConfig, getEsbuildTarget, getDefaultCacheDirectory };

let _tsConfig: TsConfigResult["config"] | undefined;
function loadTsConfig(opts: IBuildOptions) {
  _tsConfig ??= getTsconfig(opts.cwd)?.config;
}

function getEsbuildTarget(opts: IBuildOptions): string[] {
  const replaces: Record<string, string> = {
    ios_saf: "ios",
    android: "chrome",
  };

  const validTargets = browserslist(opts.browserslist)
    // `chrome 110` => ["chrome","110"]
    .map((t) => t.split(" "))
    // filter esbuild not support browers
    .filter((t) => {
      t[0] = replaces[t[0]] ?? t[0];

      // 11.0-12.0 --> 11.0
      if (t[1].includes("-")) {
        t[1] = t[1].split("-")[0];
      }

      // 11.0 --> 11
      if (t[1].endsWith(".0")) {
        t[1] = t[1].slice(0, -2);
      }
      return SUPPORTED_ESBUILD_TARGETS.includes(t[0]);
    })
    // remove dupitem
    .reduce((obj, [k, v]) => {
      obj[k] = v;
      return obj;
    }, {} as Record<string, string>);

  const targets = Object.keys(validTargets).map((k) => `${k}${validTargets[k]}`);
  const module = _tsConfig?.compilerOptions?.target ?? "es2015";
  // 提升 esbuild 压缩产物的兼容性
  targets.push(module.toLocaleLowerCase());
  return targets;
}

function getDefaultCacheDirectory(cwd: string) {
  return path.join(cwd, "node_modules", ".cache", DEFAULT_CACHE_DIRECTORY);
}
