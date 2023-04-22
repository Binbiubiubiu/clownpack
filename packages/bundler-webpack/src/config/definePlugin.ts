import { DefinePlugin } from 'webpack';
import Config from 'webpack-5-chain';
import type { IBuildOptions } from '../types';

export { useDefinePlugin };

function useDefinePlugin(config: Config, opts: IBuildOptions) {
  const env: Record<string, any> = {
    PUBLIC_PATH: opts.publicPath || '/',
  };

  Object.keys(env).forEach(key => {
    env[`process.env.${key}`] = JSON.stringify(env[key]);
  });

  const define: Record<string, any> = {};
  if (opts.define) {
    for (const key in opts.define) {
      define[key] = JSON.stringify(opts.define[key]);
    }
  }

  config.plugin('define-plugin').use(DefinePlugin, [
    {
      ...env,
      ...define,
    },
  ]);
}
