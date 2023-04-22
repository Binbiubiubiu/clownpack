import { type Platform, build } from 'esbuild';
import esbuildPresetEnv from '@clownpack/esbuild-preset-env';
import path from 'path';
import type { IBuildOptions } from '../types';
import { DEFAULT_OUTPUT_PATH, DFEAULT_RESOLVE_EXTENSIONS } from '../constants';

export default async function esbuildTransformer(this: IBuildOptions, content: string) {
  const presetOptions = {
    presetEnv: {},
    // presetReact: {},
    presetTypeScript: {},
    pluginTransformRuntime: {},
  };
  // use @babel/runtime in workspace
  if (this.pkg?.dependencies?.['@babel/runtime']) {
    presetOptions.pluginTransformRuntime = {
      absoluteRuntime: false,
      version: this.pkg.dependencies?.['@babel/runtime'],
    };
  }

  const { outputFiles } = await build({
    write: false,
    bundle: true,
    outdir: path.join(this.cwd, path.dirname(this.outDir || DEFAULT_OUTPUT_PATH)),
    sourcemap: this.sourcemap,
    logLevel: 'silent',
    format: this.format,
    define: this.define,
    platform: 'node',
    // target: this.targets,
    charset: 'utf8',
    // esbuild need relative entry path
    entryPoints: [path.relative(this.cwd, 'this.fileAbsPath')],
    absWorkingDir: this.cwd,
    plugins: [esbuildPresetEnv({ configPath: this.cwd })],
    ...this.transpilerOptions,
  });
  if (outputFiles.length === 2) {
    const [map, result] = outputFiles;
    return [result.text, map.text];
  }
  return [outputFiles[0].text];
}
