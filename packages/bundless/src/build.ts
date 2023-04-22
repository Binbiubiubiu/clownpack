import path from 'path';
import fs from 'fs';
import { glob } from '@clownpack/helper';
import { DEFAULT_BUNDLESS_IGNORES } from './constants';
import type { IBuildOptions } from './types';

/**
 * webpack 打包命令
 * @public
 */
export async function build(opts: IBuildOptions) {
  const matches = glob.sync(`${opts.input}/**`, {
    cwd: opts.cwd,
    ignore: DEFAULT_BUNDLESS_IGNORES,
    nodir: true,
  });

  for (let item of matches) {
    const itemAbsPath = path.join(opts.cwd, item);

    let itemDistPath = path.join(opts.outDir!, path.relative(opts.input, item));
    let itemDistAbsPath = path.join(opts.cwd, itemDistPath);
    const parentPath = path.dirname(itemDistAbsPath);

    // create parent directory if not exists
    if (!fs.existsSync(parentPath)) {
      fs.mkdirSync(parentPath, { recursive: true });
    }

    // get result from loaders
    //  const result = await runLoaders(itemAbsPath, {
    //   pkg: opts.pkg,
    //   cwd: opts.cwd,
    //   itemDistAbsPath,
    // });
  }
}
