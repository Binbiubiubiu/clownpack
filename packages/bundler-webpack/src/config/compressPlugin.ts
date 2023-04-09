import TerserPlugin from "terser-webpack-plugin";
import CSSMinimizerWebpackPlugin from "css-minimizer-webpack-plugin";
import Config from "webpack-5-chain";
import type { IAnyObject } from "@clownpack/helper";
import { getEsbuildTargets } from "@clownpack/esbuild-preset-env/helper";
import { Env, CSSMinifier, JSMinifier, type IBuildOptions } from "../types";

function defaultMinifier(
  v: IBuildOptions["jsMinifier"],
  dv: `${JSMinifier}`,
): false | `${JSMinifier}`;
function defaultMinifier(
  v: IBuildOptions["cssMinifier"],
  dv: `${CSSMinifier}`,
): false | `${CSSMinifier}`;
function defaultMinifier(
  v: IBuildOptions["jsMinifier"] | IBuildOptions["cssMinifier"],
  dv: `${JSMinifier}` | `${CSSMinifier}`,
): false | `${JSMinifier}` | `${CSSMinifier}` {
  return v === true ? dv : v ?? dv;
}

export function useCompressPlugin(config: Config, opts: IBuildOptions) {
  const jsMinifier = defaultMinifier(opts.jsMinifier, JSMinifier.esbuild);
  const cssMinifier = defaultMinifier(opts.cssMinifier, CSSMinifier.esbuild);

  if (opts.env === Env.development || (jsMinifier === false && cssMinifier === false)) {
    config.optimization.minimize(false);
    return;
  }

  config.optimization.minimize(true);
  let minify;
  let terserOptions: IAnyObject | undefined;
  switch (jsMinifier) {
    case false:
      break;
    case JSMinifier.esbuild:
      minify = TerserPlugin.esbuildMinify;
      terserOptions = {
        target: getEsbuildTargets({ configPath: opts.cwd }).target,
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
    case JSMinifier.uglifyJs:
      minify = TerserPlugin.uglifyJsMinify;
      terserOptions = {
        format: {
          comments: false,
        },
      };
      break;
    default:
      throw new Error(`Unsupported jsMinifier ${jsMinifier}.`);
  }
  if (minify) {
    terserOptions = {
      // esmodule 压缩
      module: opts.esModule,
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
    case false:
      break;
    case CSSMinifier.esbuild:
      cssMinify = CSSMinimizerWebpackPlugin.esbuildMinify;
      minimizerOptions = {
        target: getEsbuildTargets({ configPath: opts.cwd }).target,
      };
      break;
    case CSSMinifier.cssnano:
      cssMinify = CSSMinimizerWebpackPlugin.cssnanoMinify;
      minimizerOptions = {
        inline: false,
      };
      break;
    case CSSMinifier.parcelCSS:
      cssMinify = CSSMinimizerWebpackPlugin.parcelCssMinify;
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
