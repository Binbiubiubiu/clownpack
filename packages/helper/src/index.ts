import resolve from "resolve";
import deepmerge from "@fastify/deepmerge";
import browserslist from "browserslist";
import { getTsconfig } from "get-tsconfig";

export { type TsConfigResult, getTsconfig } from "get-tsconfig";
export { default as yParser } from "yargs-parser";
export * as colorette from "colorette";
export { sync as resolveSync } from "resolve";

export { browserslist };

export * from "./logger";
export * from "./types";

export const merge: ReturnType<typeof deepmerge> = deepmerge();

export function useEsbuildRegisterEffect(
  effect: () => void,
  ids?: string[],
  overrides?: Parameters<typeof import("esbuild-register/dist/node").register>[0],
) {
  const esbuild: typeof import("esbuild-register/dist/node") = require("esbuild-register/dist/node");
  const { unregister } = esbuild.register({
    ...(ids && { hookMatcher: (fileName) => ids!.includes(fileName) }),
    ...overrides,
  });
  effect();
  unregister();
}

export function getModuleDefaultExport(exports: any) {
  return exports?.__esModule ? exports.default : exports;
}

export function getModuleAbsPath(opts: { path: string; cwd?: string; type?: string } | string) {
  if (typeof opts === "string") {
    opts = {
      path: opts,
    };
  }
  try {
    return resolve.sync(opts.path, {
      basedir: opts.cwd ?? process.cwd(),
      extensions: [".js", ".ts", ".mjs", ".mts", ".cts"],
    });
  } catch (err) {
    throw new Error(`Invalid ${opts.type ?? "module"} "${opts.path}", can not be resolved.`);
  }
}

export function importLazy<R>(name: string, opts?: { cwd?: string }): Promise<R> {
  return import(resolve.sync(name, { basedir: opts?.cwd ?? process.cwd() }));
}

export function getPlatformInfo(opts?: {
  targets?: string | string[] | Record<string, number>;
  replaces?: Record<string, string>;
  whitelist?: Array<string>;
  configPath?: string;
  ignoreBrowserslistConfig?: boolean;
  browserslistEnv?: string;
  defaultEsTarget?: string;
}) {
  const {
    targets,
    replaces = {},
    whitelist,
    configPath = process.cwd(),
    ignoreBrowserslistConfig = false,
    browserslistEnv,
    defaultEsTarget = "es2015",
  } = opts || {};

  let targetMap: Record<string, number> = {};
  if (ignoreBrowserslistConfig) {
  } else if (typeof targets === "object" && targets !== null && !Array.isArray(targets)) {
    targetMap = targets;
  } else if (
    typeof targets === "undefined" ||
    targets === null ||
    typeof targets === "string" ||
    (Array.isArray(targets) && targets.every((t) => typeof t === "string"))
  ) {
    targetMap = browserslist(targets, { path: configPath, env: browserslistEnv })
      // `chrome 110` => ["chrome","110"]
      .map((t) => t.split(" "))
      // filter esbuild not support browers
      .filter((t) => {
        t[0] = replaces[t[0]] || t[0];

        // 11.0-12.0 --> 11.0
        if (t[1].includes("-")) {
          t[1] = t[1].split("-")[0];
        }

        // 11.0 --> 11
        if (t[1].endsWith(".0")) {
          t[1] = t[1].slice(0, -2);
        }
        return whitelist ? whitelist.includes(t[0]) : true;
      })
      // remove dupitem
      .reduce((obj, [k, v]) => {
        obj[k] = obj[k] ? Math.min(obj[k], +v) : +v;
        return obj;
      }, {} as Record<string, number>);
  }

  const esTarget = getTsconfig(configPath)?.config?.compilerOptions?.target ?? defaultEsTarget;

  return {
    targets: targetMap,
    esTarget,
  };
}
