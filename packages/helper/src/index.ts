import { register } from "esbuild-register/dist/node";
import yParser from "yargs-parser";
import resolve from "resolve";
import deepmerge from "@fastify/deepmerge";
import * as colorette from "colorette";

export {
  yParser,
  colorette,
  merge,
  resolveSync,
  createEsbuildRegister,
  getModuleAbsPath,
  getModuleDefaultExport,
  importLazy,
};

export { Trace } from "./trace";

const merge: ReturnType<typeof deepmerge> = deepmerge();
const resolveSync = resolve.sync;

function createEsbuildRegister(overrides?: Parameters<typeof register>[0]) {
  const { unregister } = register(overrides);
  return unregister;
}

function getModuleDefaultExport(exports: any) {
  return exports.__esModule ? exports.default : exports;
}

function getModuleAbsPath(opts: { name: string; cwd?: string; type?: string } | string) {
  if (typeof opts === "string") {
    opts = {
      name: opts,
    };
  }
  try {
    return resolve.sync(opts.name, {
      basedir: opts.cwd ?? process.cwd(),
      extensions: [".js", ".ts", ".mjs", ".mts", ".cts"],
    });
  } catch (err) {
    throw new Error(`Invalid ${opts.type ?? "module"} "${opts.name}", can not be resolved.`);
  }
}

function importLazy<R = any>(name: string, opts?: { cwd?: string }): Promise<R> {
  return import(resolve.sync(name, { basedir: opts?.cwd ?? process.cwd() }));
}
