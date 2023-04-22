import { getAliasFromTsconfig, importLazy } from '@clownpack/helper';
import { ApplyPluginsType, type IPluginAPI } from '@clownpack/core';
import type { webpack } from '@clownpack/bundler-webpack';
import { Env, Format, type WebpackConfiguration } from '../types';

const SUPPOTR_FORMAT = {
  umd: 'umd',
  cjs: 'commonjs-static',
  esm: 'module',
};

export async function build(
  api: IPluginAPI<WebpackConfiguration>
): Promise<webpack.Stats | undefined> {
  const { input, output, alias, ...userConfig } = api.config;
  const { format = Format.esm } = output || {};

  const bundler = await importLazy<typeof import('@clownpack/bundler-webpack')>(
    '@clownpack/bundler-webpack',
    {
      cwd: api.cwd,
    }
  );

  if (!(format in SUPPOTR_FORMAT)) {
    throw new Error(`module ${format} is not supported`);
  }
  if (format === Format.umd && !output?.name) {
    throw new Error(`module ${format} need output.name`);
  }

  return bundler.build({
    name: api.pkg.name,
    cwd: api.cwd,
    env: api.env as `${Env}`,
    pkg: api.pkg,
    input: typeof input === 'string' ? { main: input } : input,
    alias: { ...getAliasFromTsconfig(api.cwd), ...alias },
    clean: output?.clean,
    esModule: format === Format.esm,
    ...userConfig,
    chainWebpack: async (config, args) => {
      config.output.library({
        type: SUPPOTR_FORMAT[format],
        umdNamedDefine: true,
        ...(format === Format.umd && output?.name && { name: output.name }),
      });

      await userConfig.chainWebpack?.(config, args);

      await api.applyPlugins({
        name: 'chainWebpack',
        type: ApplyPluginsType.modify,
        initialValue: config,
        args,
      });
    },
    modifyWebpackConfig: async (config, args) => {
      if (userConfig.modifyWebpackConfig) {
        config = await userConfig.modifyWebpackConfig(config, args);
      }

      const modifiedConfig = await api.applyPlugins({
        name: 'modifyWebpackConfig',
        initialValue: config,
        args,
      });

      return modifiedConfig ?? config;
    },
  });
}
