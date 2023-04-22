import browserslist from 'browserslist';
import { getTsconfig } from './tsconfig';

/**
 * @public
 */
export function getPlatformInfo(opts?: {
  targets?: string | string[] | Record<string, string>;
  replaces?: Record<string, string>;
  whitelist?: Array<string>;
  configPath?: string;
  ignoreBrowserslistConfig?: boolean;
  browserslistEnv?: string;
  defaultEsTarget?: string;
}) {
  const {
    targets,
    replaces = {},
    whitelist,
    configPath = process.cwd(),
    ignoreBrowserslistConfig = false,
    browserslistEnv,
    defaultEsTarget = 'es2015',
  } = opts || {};

  let targetMap: Record<string, string> = {};
  if (typeof targets === 'object' && targets !== null && !Array.isArray(targets)) {
    targetMap = targets;
  } else if (ignoreBrowserslistConfig) {
    // ignore browserslist
  } else if (
    typeof targets === 'undefined' ||
    targets === null ||
    typeof targets === 'string' ||
    (Array.isArray(targets) && targets.every(t => typeof t === 'string'))
  ) {
    targetMap = browserslist(targets, { path: configPath, env: browserslistEnv })
      // `chrome 110` => ["chrome","110"]
      .map(t => t.split(' '))
      // filter esbuild not support browers
      .filter(t => {
        t[0] = replaces[t[0]] || t[0];

        // 11.0-12.0 --> 11.0
        if (t[1].includes('-')) {
          t[1] = t[1].split('-')[0];
        }

        // 11.0 --> 11
        if (t[1].endsWith('.0')) {
          t[1] = t[1].slice(0, -2);
        }
        return whitelist ? whitelist.includes(t[0]) : true;
      })
      // remove dupitem
      .reduce((obj, [k, v]) => {
        obj[k] = obj[k] ? `${Math.min(+obj[k], +v)}` : v;
        return obj;
      }, {} as Record<string, string>);
  }

  const esTarget = getTsconfig(configPath)?.config?.compilerOptions?.target ?? defaultEsTarget;

  return {
    targets: targetMap,
    esTarget,
  };
}
