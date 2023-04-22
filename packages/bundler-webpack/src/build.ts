import webpack from 'webpack';
import { getConfig } from './config';
import type { IBuildOptions } from './types';

/**
 * webpack 打包命令
 * @public
 */
export async function build(opts: IBuildOptions) {
  const webpackConfig = await getConfig(opts);

  const compiler = webpack(webpackConfig);
  let closeWatching: webpack.Watching['close'];

  type Callback = Parameters<typeof compiler.run>[0];
  type Result = Parameters<Callback>[1];

  let isFirstCompile = true;
  return new Promise<Result>((resolve, reject) => {
    const handler: Callback = async (err, stats) => {
      const validErr =
        err || (stats?.hasErrors() ? new Error(stats.toString('errors-only')) : null);

      await opts.onBuildComplete?.({
        err: validErr,
        stats,
        isFirstCompile,
        // pass close function to close watching
        ...(opts.watch ? { close: closeWatching } : {}),
      });

      isFirstCompile = false;
      if (validErr) {
        reject(validErr);
      } else {
        resolve(stats!);
      }

      if (!opts.watch) {
        compiler.close(() => {});
      }
    };

    if (opts.watch) {
      const watchOptions =
        typeof opts.watch === 'object' ? opts.watch : webpackConfig.watchOptions ?? {};
      compiler.watch(watchOptions, handler);
    } else {
      compiler.run(handler);
    }
  });
}
