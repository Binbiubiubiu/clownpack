import browserslist from "browserslist";
import path from "path";
import { DEFAULT_CACHE_DIRECTORY, DEFAULT_TARGETS, SUPPORTED_ESBUILD_TARGETS } from "./constants";
import type { IAnyObject, IBuildOptions } from "./types";

export { getEsbuildTarget, getPostcssBrowsers, getBabelTargets, getDefaultCacheDirectory };

function isString(targets: unknown): targets is string {
  return typeof targets === "string";
}

function isStrings(targets: unknown): targets is string[] {
  return Array.isArray(targets) && targets.every(isString);
}

function getEsbuildTarget(opts: IBuildOptions): string[] {
  const targets = opts.targets || DEFAULT_TARGETS;

  const replaces: Record<string, string> = {
    ios_saf: "ios",
    android: "chrome",
  };

  let validTargets = (targets || {}) as IAnyObject;

  if (isString(targets) || isStrings(targets)) {
    validTargets = browserslist(targets)
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
  } else {
    for (const key in validTargets) {
      if (!SUPPORTED_ESBUILD_TARGETS.includes(key)) {
        throw new Error(`Esbuild does not support targets ${key}`);
      }
    }
  }

  return Object.keys(validTargets).map((k) => `${k}${validTargets[k]}`);
}

function getPostcssBrowsers(opts: IBuildOptions): string | string[] {
  const targets = opts.targets || DEFAULT_TARGETS;

  if (isString(targets) || isStrings(targets)) {
    return targets;
  }

  const obj = targets as IAnyObject;
  return (
    obj.browsers ||
    Object.keys(obj).map((key) => {
      return `${key} >= ${obj[key] === true ? "0" : obj[key]}`;
    })
  );
}

function getBabelTargets(opts: IBuildOptions) {
  return opts.targets || DEFAULT_TARGETS;
}

function getDefaultCacheDirectory(cwd: string) {
  return path.join(cwd, "node_modules", ".cache", DEFAULT_CACHE_DIRECTORY);
}
