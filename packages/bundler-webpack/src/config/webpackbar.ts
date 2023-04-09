import Webpackbar from "webpackbar";
import Config from "webpack-5-chain";
import { IBuildOptions } from "../types";

export { useWebpackbar };

function useWebpackbar(config: Config, opts: IBuildOptions) {
  config.plugin("webpackbar").use(Webpackbar, [{ name: opts.name || "webpack" }]);
}
