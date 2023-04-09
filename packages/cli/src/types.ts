import type { IConfiguration, IPluginAPI, PluginItem } from "@clownpack/core";

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
export interface Output {
  format: `${Format}`;
  clean?: boolean;
  dir?: string;
  filename?: string;
  name?: string;
}

/**
 * @public
 */
export interface BaseConfiguration<T> extends IConfiguration {
  runner: T;
  input: string | { [key: string]: string };
  output?: Output;
}

/**
 * @public
 */
export type WebpackConfiguration = BaseConfiguration<"webpack"> &
  Pick<
    import("@clownpack/bundler-webpack").IBuildOptions,
    | "name"
    | "browserslist"
    | "alias"
    | "externals"
    | "extraBabelPresets"
    | "extraBabelPlugins"
    | "extraPostCSSPlugins"
    | "transpiler"
    | "cssMinifier"
    | "jsMinifier"
    | "chainWebpack"
    | "modifyWebpackConfig"
  >;

/**
 * @public
 */
export type BundlessConfiguration = BaseConfiguration<"bundless"> &
  Pick<
    import("@clownpack/bundless").IBuildOptions,
    | "name"
    | "targets"
    | "alias"
    | "extraBabelPresets"
    | "extraBabelPlugins"
    | "transpiler"
    | "transpilerOptions"
  >;

/**
 * @public
 */
export type Configuration = BundlessConfiguration | WebpackConfiguration;

/**
 * @public
 */
export interface IApi extends IPluginAPI<Configuration> {
  modifyWebpackConfig(fn: WebpackConfiguration["modifyWebpackConfig"]): void;
  chainWebpack(fn: WebpackConfiguration["chainWebpack"]): void;
}
