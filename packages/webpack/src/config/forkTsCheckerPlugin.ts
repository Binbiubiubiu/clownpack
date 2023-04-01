import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import Config from "webpack-5-chain";
import type { IBuildOptions } from "../types";

export { useForkTsCheckerPlugin };

function useForkTsCheckerPlugin(config: Config, _opts: IBuildOptions) {
  config.plugin("fork-ts-checker-plugin").use(ForkTsCheckerPlugin);
}
