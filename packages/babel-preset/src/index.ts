import { IOptions } from './types';
import { getCorejsVersion, getDepVersion, presetPkgPath } from './helper';

export = function (_: any, opts: IOptions) {
  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          bugfixes: true,
          spec: false,
          loose: false,
          modules: false,
          debug: false,
          forceAllTransforms: false,
          ignoreBrowserslistConfig: true,
          ...(!opts.pluginTransformRuntime && { useBuiltIns: 'entry', corejs: getCorejsVersion() }),
          ...opts.presetEnv,
        },
      ],
      opts.presetReact && [
        require.resolve('@babel/preset-react'),
        {
          runtime: 'automatic',
          development: process.env.NODE_ENV === 'development',
          ...opts.presetReact,
        },
      ],
      [
        require.resolve('@babel/preset-typescript'),
        {
          allowDeclareFields: true,
          allowNamespaces: true,
          onlyRemoveTypeImports: false,
          optimizeConstEnums: true,
          ...opts.presetTypescript,
        },
      ],
    ].filter(Boolean),
    plugins: [
      opts.pluginTransformRuntime && [
        require.resolve('@babel/plugin-transform-runtime'),
        {
          corejs: false,
          helpers: true,
          regenerator: true,
          absoluteRuntime: presetPkgPath,
          version: getDepVersion('@babel/runtime'),
          ...opts.pluginTransformRuntime,
        },
      ],
    ].filter(Boolean),
  };
};
