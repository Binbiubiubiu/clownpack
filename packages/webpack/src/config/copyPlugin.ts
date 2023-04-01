import CopyPlugin, { type Pattern } from "copy-webpack-plugin";
import Config from "webpack-5-chain";
import type { IBuildOptions } from "../types";
import path from "path";

export { useCopyPlugin };

function useCopyPlugin(config: Config, opts: IBuildOptions) {
  const copyPatterns: Pattern[] = [
    {
      from: path.join(opts.cwd, "public"),
      info: { minimized: true },
    },
  ];

  if (opts.copy) {
    for (const item of opts.copy) {
      let pattern: Pattern;
      if (typeof item === "string") {
        pattern = { from: item, info: { minimized: true } };
      } else {
        pattern = {
          ...item,
        };
        item.info ??= { minimized: true };
      }
      copyPatterns.push(pattern);
    }
  }

  config.plugin("copy-webpack-plugin").use(CopyPlugin, [
    {
      patterns: copyPatterns,
    },
  ]);
}
