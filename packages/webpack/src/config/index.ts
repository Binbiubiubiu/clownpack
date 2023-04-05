import Config from "webpack-5-chain";
import webpack from "webpack";
import path from "path";
import { browserslist } from "@clownpack/helper";
import { DEFAULT_DEVTOOL, DEFAULT_OUTPUT_PATH, DFEAULT_RESOLVE_EXTENSIONS } from "../constants";
import { type IBuildOptions } from "../types";
// rules
import { useAssets } from "./assets";
import { useCss } from "./css";
import { useJs } from "./js";
// plugins
import { useBundleAnalyzerPlugin } from "./bundleAnalyzerPlugin";
import { useCompressPlugin } from "./compressPlugin";
import { useDefinePlugin } from "./definePlugin";
import { useForkTsCheckerPlugin } from "./forkTsCheckerPlugin";
import { useFriendlyErrorsPlugin } from "./friendlyErrorsPlugin";
import { useMiniCssExtractPlugin } from "./miniCssExtractPlugin";
import { useCopyPlugin } from "./copyPlugin";
import { useWebpackbar } from "./webpackbar";
import { useSpeedMeasurePlugin } from "./speedMeasurePlugin";
import { getDefaultCacheDirectory, loadTsConfig } from "../utils";

export { getConfig };

async function getConfig(opts: IBuildOptions) {
  const config = new Config();

  if (opts.name) {
    config.name(opts.name);
  }

  // @ts-ignore
  config.mode(opts.env);
  config.stats("none");

  for (const key in opts.entry) {
    config.entry(key).add(path.resolve(opts.cwd, opts.entry[key]));
  }

  // devtool
  config.devtool(
    opts.devtool === false
      ? false
      : opts.devtool ?? (opts.env === "development" ? DEFAULT_DEVTOOL : false),
  );

  // config.devtool()
  opts.outDir ||= DEFAULT_OUTPUT_PATH;
  const absOutputPath = path.resolve(opts.cwd, opts.outDir);
  config.output
    .path(absOutputPath)
    .clean(opts.clean || false)
    .filename(opts.hash ? "[name].[contenthash:8].js" : "[name].js")
    .chunkFilename(opts.hash ? "[name].[contenthash:8].chunk.js" : "[name].chunk.js")
    .publicPath(opts.publicPath || "auto")
    .set("assetModuleFilename", "static/[name].[hash:8][ext]")
    .set("hashFunction", "xxhash64");

  config.resolve
    .symlinks(true)
    .modules.add("node_modules")
    .end()
    .alias.merge(opts.alias || {})
    .end()
    .extensions.merge(DFEAULT_RESOLVE_EXTENSIONS)
    .end();

  config.externals(opts.externals || []);

  loadTsConfig(opts);

  // 设置默认的 browserslist
  if (!opts.browserslist?.length) {
    opts.browserslist =
      browserslist(opts.browserslist, { path: opts.cwd }) ?? (browserslist.defaults as string[]);
  }
  // webpack 默认 target browserslist 优先
  process.env.BROWSERSLIST = ([] as string[]).concat(opts.browserslist ?? []).join(",");
  // config.target("browserslist");
  // config.target(["web", "es5"]);

  // config.experiments({
  //   topLevelAwait: true,
  //   outputModule: opts.module === "esm",
  // });

  // rules
  useAssets(config, opts);
  useCss(config, opts);
  useJs(config, opts);

  // plugins
  useCompressPlugin(config, opts);
  useDefinePlugin(config, opts);
  useForkTsCheckerPlugin(config, opts);
  useMiniCssExtractPlugin(config, opts);
  useCopyPlugin(config, opts);
  useWebpackbar(config, opts);
  useFriendlyErrorsPlugin(config, opts);

  // cache
  if (opts.cache) {
    const extraCacheOptions = opts.cache as any;
    config.cache({
      type: "filesystem",
      version: require("../../package.json").version,
      cacheDirectory: extraCacheOptions.cacheDirectory ?? getDefaultCacheDirectory(opts.cwd),
      ...extraCacheOptions,
    });
  }

  useBundleAnalyzerPlugin(config, opts);

  // chain webpack
  if (opts.chainWebpack) {
    await opts.chainWebpack(config, {
      env: opts.env,
      webpack,
    });
  }

  let webpackConfig = config.toConfig();

  webpackConfig = useSpeedMeasurePlugin(webpackConfig, opts);

  if (opts.modifyWebpackConfig) {
    webpackConfig = await opts.modifyWebpackConfig(webpackConfig, {
      env: opts.env,
      webpack,
    });
  }

  return webpackConfig;
}
