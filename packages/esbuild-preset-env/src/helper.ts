import { Logger, getPlatformInfo } from '@clownpack/helper';
import type { IOptions } from './types';
import type { Platform } from 'esbuild';

export const SUPPORTED_ESBUILD_TARGETS = [
  'chrome',
  'edge',
  'firefox',
  'ie',
  'ios',
  'node',
  'opera',
  'safari',

  'deno',
  'hermes',
  'rhino',
];

export function getEsbuildTargets(options: IOptions = {}) {
  const { targets, esTarget } = getPlatformInfo({
    ...options,
    replaces: {
      ios_saf: 'ios',
      android: 'chrome',
    },
  });

  let platform: Platform = 'browser';
  if ('node' in targets) {
    if (Object.keys(targets).length > 1) {
      delete targets['node'];
      Logger.warn("esbuild target can't both in the browser and node");
    } else {
      platform = 'node';
    }
  }

  const target: string[] = [esTarget];
  for (const item in targets) {
    if (SUPPORTED_ESBUILD_TARGETS.includes(item)) {
      target.push(`${item}${targets[item]}`);
    }
  }

  Logger.info(`[getEsbuildTargets] platform = ${platform}`);
  Logger.info(`[getEsbuildTargets] target = ${target.join(',')}`);

  return {
    platform,
    target,
  };
}
