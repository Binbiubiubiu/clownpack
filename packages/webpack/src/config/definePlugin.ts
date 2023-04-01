import { DefinePlugin } from "webpack";
import Config from "webpack-5-chain";
import type { IBuildOptions } from "../types";

export { useDefinePlugin };

function useDefinePlugin(config: Config, opts: IBuildOptions) {
  const define: Record<string, any> = {};
  if (opts.define) {
    for (const key in opts.define) {
      define[key] = JSON.stringify(opts.define[key]);
    }
  }

  config.plugin("define-plugin").use(DefinePlugin, [
    {
      PUBLIC_PATH: opts.publicPath || "/",
      ...define,
    },
  ]);
}
