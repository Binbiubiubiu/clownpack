import type { IConfiguration, PluginItem } from "@clownpack/core";
import { type } from "os";

export enum Env {
  development = "development",
  production = "production",
}

export enum Format {
  cjs = "cjs",
  esm = "esm",
  umd = "umd",
}

export enum Runner {
  webpack = "webpack",
  tsc = "tsc",
}
interface BaseConfiguration<T> extends IConfiguration {
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

type WebpackConfiguration = BaseConfiguration<"webpack"> &
  import("@clownpack/webpack").IConfiguration;

export type Configuration = BaseConfiguration<"tsc"> | WebpackConfiguration;

const a: Configuration = {
  runner: "tsc",
};
