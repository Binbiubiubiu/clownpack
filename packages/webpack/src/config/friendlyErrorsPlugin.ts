// @ts-ignore
import FriendlyErrorsPlugin from "@nuxtjs/friendly-errors-webpack-plugin";
import Config from "webpack-5-chain";
import { IBuildOptions } from "../types";

export { useFriendlyErrorsPlugin };

function useFriendlyErrorsPlugin(config: Config, _opts: IBuildOptions) {
  config.plugin("friendly-errors-webpack-plugin").use(FriendlyErrorsPlugin, [
    {
      clearConsole: false,
      logLevel: "ERROR",
    },
  ]);
}
