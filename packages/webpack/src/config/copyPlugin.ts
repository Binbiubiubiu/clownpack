import CopyPlugin, { type Pattern } from "copy-webpack-plugin";
import Config from "webpack-5-chain";
import fs from "fs";
import path from "path";
import type { IBuildOptions } from "../types";
import { DEFAULT_PUBLIC_PATH } from "../constants";

export { useCopyPlugin };

function isNotEmptyDir(dir: string) {
  return fs.existsSync(dir) && fs.readdirSync(dir).length;
}

function useCopyPlugin(config: Config, opts: IBuildOptions) {
  const copyPatterns: Pattern[] = [];

  const publicDir = path.join(opts.cwd, DEFAULT_PUBLIC_PATH);
  if (isNotEmptyDir(publicDir)) {
    copyPatterns.push({
      from: publicDir,
      info: { minimized: true },
    });
  }

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

  if (copyPatterns.length) {
    config.plugin("copy-webpack-plugin").use(CopyPlugin, [
      {
        patterns: copyPatterns,
      },
    ]);
  }
}
