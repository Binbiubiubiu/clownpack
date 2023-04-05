import { Plugin, Platform } from "esbuild";
import { Logger, getPlatformInfo } from "@clownpack/helper";

export const SUPPORTED_ESBUILD_TARGETS = [
  "chrome",
  "edge",
  "firefox",
  // "ie",
  "ios",
  "node",
  "opera",
  "safari",

  "deno",
  "hermes",
  "rhino",
];

export interface IOptions {
  targets?: string | string[] | Record<string, number>;
  configPath?: string;
  ignoreBrowserslistConfig?: boolean;
  browserslistEnv?: string;
}

export function getEsbuildTargets(options: IOptions = {}) {
  const { targets, esTarget } = getPlatformInfo({
    ...options,
    replaces: {
      ios_saf: "ios",
      android: "chrome",
    },
  });

  let platform: Platform = "browser";
  if ("node" in targets) {
    if (Object.keys(targets).length > 1) {
      delete targets["node"];
      Logger.warn("esbuild target can't both in the browser and node");
    } else {
      platform = "node";
    }
  }

  const target: string[] = [esTarget];
  for (const item in targets) {
    if (SUPPORTED_ESBUILD_TARGETS.includes(item)) {
      target.push(`${item}${targets[item]}`);
    }
  }

  Logger.info(`[getEsbuildTargets] platform = ${platform}`);
  Logger.info(`[getEsbuildTargets] target = ${target.join(",")}`);

  return {
    platform,
    target,
  };
}

export default function (opts: IOptions = {}): Plugin {
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
