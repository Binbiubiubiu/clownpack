import type { Configuration } from "webpack";
import type { IBuildOptions } from "../types";
import path from "path";

export { useSpeedMeasurePlugin };

function useSpeedMeasurePlugin(webpackConfig: Configuration, opts: IBuildOptions) {
  if (process.env.SPEED_MEASURE) {
    const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
    const smpOption =
      process.env.SPEED_MEASURE === "JSON"
        ? {
            outputFormat: "json",
            outputTarget: path.join(opts.cwd, "SPEED_MEASURE.json"),
          }
        : { outputFormat: "human", outputTarget: console.log };
    webpackConfig = new SpeedMeasurePlugin(smpOption).wrap(webpackConfig);
  }
  return webpackConfig;
}
