import type { IConfiguration, IPluginAPI } from '@clownpack/core';

/**
 * bundless 插件
 * @public
 */
export default function bundlessPlugin(api: IPluginAPI<IConfiguration>) {
  // ["chainWebpack", "modifyWebpackConfig"].forEach((name) => {
  //   api.registerMethod({
  //     name,
  //   });
  // });
}

export { build } from './build';
export * from './types';
