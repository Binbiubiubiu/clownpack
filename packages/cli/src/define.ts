import type { IAnyObject } from "@clownpack/helper";
import type { PluginDefineOptions } from "@clownpack/core";
import type { Configuration, IApi } from "./types";

/**
 * @public
 */
export function defineConfig(config: Configuration) {
  return config;
}

/**
 * @public
 */
export function definePlugin<T = IAnyObject>(options: PluginDefineOptions<IApi, T>) {
  return options;
}
