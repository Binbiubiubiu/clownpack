import resolve from "resolve";
import deepmerge from "@fastify/deepmerge";

export { type TsConfigResult, getTsconfig } from "get-tsconfig";
export { default as yParser } from "yargs-parser";
export { default as browserslist } from "browserslist";
export * as colorette from "colorette";
export { sync as resolveSync } from "resolve";

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
