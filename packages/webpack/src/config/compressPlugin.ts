import TerserPlugin from "terser-webpack-plugin";
import CSSMinimizerWebpackPlugin from "css-minimizer-webpack-plugin";
import Config from "webpack-5-chain";
import { Env, CSSMinifier, JSMinifier, type IAnyObject, type IBuildOptions } from "../types";
import { getEsbuildTarget } from "../utils";
import { DEFAULT_TARGETS } from "../constants";

export { useCompressPlugin };

function useCompressPlugin(config: Config, opts: IBuildOptions) {
  const jsMinifier = opts.jsMinifier || JSMinifier.esbuild;
  const cssMinifier = opts.cssMinifier || CSSMinifier.esbuild;

  if (
    opts.env === Env.development ||
    (jsMinifier === JSMinifier.none && cssMinifier === CSSMinifier.none)
  ) {
    config.optimization.minimize(false);
    return;
  }

  const esbuildTarget = getEsbuildTarget(opts);
  // 提升 esbuild 压缩产物的兼容性，比如不出现 ?? 这种语法
  // esbuildTarget.push("es2015");

  config.optimization.minimize(true);
  let minify;
  let terserOptions: IAnyObject | undefined;
  switch (jsMinifier) {
    case JSMinifier.esbuild:
      minify = TerserPlugin.esbuildMinify;
      terserOptions = {
        target: esbuildTarget,
        // remove all comments
        legalComments: "none",
      };
      break;
    case JSMinifier.terser:
      minify = TerserPlugin.terserMinify;
      terserOptions = {
        format: {
          comments: false,
        },
      };
      break;
    case JSMinifier.swc:
      minify = TerserPlugin.swcMinify;
      break;
    case JSMinifier.swc:
      minify = TerserPlugin.uglifyJsMinify;
      terserOptions = {
        format: {
          comments: false,
        },
      };
      break;
    case JSMinifier.none:
      break;
    default:
      throw new Error(`Unsupported jsMinifier ${jsMinifier}.`);
  }
  if (minify) {
    terserOptions = {
      ...terserOptions,
      ...opts.jsMinifierOptions,
    };

    config.optimization.minimizer(`js-${jsMinifier}`).use(TerserPlugin, [
      {
        extractComments: false,
        minify,
        terserOptions,
      },
    ]);
  }

  let cssMinify: any;
  let minimizerOptions: IAnyObject | undefined;
  switch (cssMinifier) {
    case CSSMinifier.esbuild:
      cssMinify = CSSMinimizerWebpackPlugin.esbuildMinify;
      minimizerOptions = {
        target: esbuildTarget,
      };
      break;
    case CSSMinifier.cssnano:
      cssMinify = CSSMinimizerWebpackPlugin.cssnanoMinify;
      break;
    case CSSMinifier.parcelCSS:
      cssMinify = CSSMinimizerWebpackPlugin.parcelCssMinify;
      break;
    case CSSMinifier.none:
      break;
    default:
      throw new Error(`Unsupported cssMinifier ${cssMinifier}.`);
  }

  if (cssMinify) {
    minimizerOptions = {
      ...minimizerOptions,
      ...opts.cssMinifierOptions,
    };

    config.optimization.minimizer(`css-${jsMinifier}`).use(CSSMinimizerWebpackPlugin, [
      {
        minify: cssMinify,
        minimizerOptions,
      },
    ]);
  }
}
