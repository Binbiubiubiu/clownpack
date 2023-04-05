import type { IAnyObject } from "@clownpack/helper";
import type { PluginDefineOptions } from "@clownpack/core";
import type { Configuration } from "./types";

export function defineConfig(config: Configuration) {
  return config;
}

export function definePlugin<T = IAnyObject>(options: PluginDefineOptions<Configuration, T>) {
  return options;
}
