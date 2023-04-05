export {
  DEFAULT_DEVTOOL,
  DEFAULT_OUTPUT_PATH,
  DEFAULT_PUBLIC_PATH,
  DEFAULT_CACHE_DIRECTORY,
  DFEAULT_RESOLVE_EXTENSIONS,
  SUPPORTED_ESBUILD_TARGETS,
};

const DEFAULT_DEVTOOL = "cheap-module-source-map";
const DEFAULT_OUTPUT_PATH = "dist";
const DEFAULT_PUBLIC_PATH = "public";
const DEFAULT_CACHE_DIRECTORY = "clownpack-webapck";
const DFEAULT_RESOLVE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".wasm"];

const SUPPORTED_ESBUILD_TARGETS = [
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
