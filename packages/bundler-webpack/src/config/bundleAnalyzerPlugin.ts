// @ts-ignore
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import Config from 'webpack-5-chain';
import { IBuildOptions } from '../types';

export { useBundleAnalyzerPlugin };

function useBundleAnalyzerPlugin(config: Config, opts: IBuildOptions) {
  if (opts.analyze) {
    const extraAnalyzeOptions = opts.analyze === true ? {} : opts.analyze;

    config.plugin('webpack-bundle-analyzer').use(BundleAnalyzerPlugin, [
      // https://github.com/webpack-contrib/webpack-bundle-analyzer
      {
        analyzerMode: 'server',
        analyzerPort: 'auto',
        openAnalyzer: true,
        logLevel: 'info',
        defaultSizes: 'parsed',
        ...extraAnalyzeOptions,
      },
    ]);
  }
}
