import browserslist from "browserslist";

export {
  DEFAULT_DEVTOOL,
  DEFAULT_OUTPUT_PATH,
  DEFAULT_PUBLIC_PATH,
  DEFAULT_CACHE_DIRECTORY,
  DEFAULT_TARGETS,
  SUPPORTED_ESBUILD_TARGETS,
};

const DEFAULT_DEVTOOL = "cheap-module-source-map";
const DEFAULT_OUTPUT_PATH = "dist";
const DEFAULT_PUBLIC_PATH = "public";
const DEFAULT_CACHE_DIRECTORY = "clownpack-webapck";
const DEFAULT_TARGETS = browserslist.defaults;

const SUPPORTED_ESBUILD_TARGETS = [
  // "es",
  "chrome",
  "edge",
  "firefox",
  "ios",
  "node",
  "safari",
];
