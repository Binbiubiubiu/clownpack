import type { IConfiguration, PluginItem } from "@clownpack/core";

/**
 * @public
 */
export enum Env {
  development = "development",
  production = "production",
}

/**
 * @public
 */
export enum Format {
  cjs = "cjs",
  esm = "esm",
  umd = "umd",
}

/**
 * @public
 */
export enum Runner {
  webpack = "webpack",
  tsc = "tsc",
}

/**
 * @public
 */
export interface BaseConfiguration<T> extends IConfiguration {
  runner: T;
  input?: string | { [key: string]: string };
  format?: `${Format}`;
  outDir?: string;
  browserslist?: string | string[]; //| { [key: string]: any };
  name?: string;
  clean?: boolean;
  externals?: string[];
  extraBabelPresets?: PluginItem[];
  extraBabelPlugins?: PluginItem[];
  extraPostCSSPlugins?: PluginItem[];
}

/**
 * @public
 */
export type WebpackConfiguration = BaseConfiguration<"webpack"> &
  import("@clownpack/webpack").IConfiguration;

/**
 * @public
 */
export type Configuration = BaseConfiguration<"tsc"> | WebpackConfiguration;
