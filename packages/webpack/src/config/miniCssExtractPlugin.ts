import Config from "webpack-5-chain";
import { IBuildOptions } from "../types";

export { useMiniCssExtractPlugin };

function useMiniCssExtractPlugin(config: Config, opts: IBuildOptions) {
  if (opts.cssExtract) {
    if (opts.cssExtract === true) {
      opts.cssExtract = {};
    }
    const hash = opts.hash ? ".[contenthash:8]" : "";
    config.plugin("mini-css-extract-plugin").use(require("mini-css-extract-plugin"), [
      {
        filename: `[name]${hash}.css`,
        chunkFilename: `[name]${hash}.chunk.css`,
        ignoreOrder: true,
        ...opts.cssExtract,
      },
    ]);
  }
}
