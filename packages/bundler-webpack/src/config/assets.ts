import Config from 'webpack-5-chain';
import type { IBuildOptions } from '../types';

export { useAssets };

function useAssets(config: Config, opts: IBuildOptions) {
  const genAssetSubPath = (dir: string) =>
    `static/${dir}/[name]${opts.hash ? '.[hash:8]' : ''}[ext]`;

  const rule = config.module.rule('asset');
  const inlineLimit = opts.inlineLimit || 10000;

  rule
    .oneOf('images')
    .test(/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/)
    .type('asset')
    .parser({
      dataUrlCondition: {
        maxSize: inlineLimit,
      },
    })
    .generator({
      filename: genAssetSubPath('img'),
    });

  rule
    .oneOf('media')
    .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
    .type('asset')
    .parser({
      dataUrlCondition: {
        maxSize: inlineLimit,
      },
    })
    .generator({
      filename: genAssetSubPath('media'),
    });

  rule
    .oneOf('fonts')
    .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
    .type('asset')
    .parser({
      dataUrlCondition: {
        maxSize: inlineLimit,
      },
    })
    .generator({
      filename: genAssetSubPath('fonts'),
    });

  config.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .type('asset/resource')
    .use('svgo-loader')
    .loader(require.resolve('svgo-loader'))
    .options({
      configFile: false,
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              // viewBox is required to resize SVGs with CSS.
              // @see https://github.com/svg/svgo/issues/1128
              removeViewBox: false,
            },
          },
        },
      ],
      ...opts.svgoLoader,
    })
    .end()
    .generator({
      filename: genAssetSubPath('img'),
    });
}
