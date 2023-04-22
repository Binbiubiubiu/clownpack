import resolve from 'resolve';

export { sync as resolveSync } from 'resolve';

/**
 * @public
 */
export function getModuleDefaultExport(exports: any) {
  return exports?.__esModule ? exports.default : exports;
}

/**
 * @public
 */
export function getModuleAbsPath(opts: { path: string; cwd?: string; type?: string } | string) {
  if (typeof opts === 'string') {
    opts = {
      path: opts,
    };
  }
  try {
    return resolve.sync(opts.path, {
      basedir: opts.cwd ?? process.cwd(),
      extensions: ['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts'],
    });
  } catch (err) {
    throw new Error(`Invalid ${opts.type ?? 'module'} "${opts.path}", can not be resolved.`);
  }
}

/**
 * @public
 */
export function importLazy<R>(name: string, opts?: { cwd?: string }): Promise<R> {
  return import(resolve.sync(name, { basedir: opts?.cwd ?? process.cwd() }));
}

/**
 *
 * @public
 */
export function slash(path: string) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);

  if (isExtendedLengthPath) {
    return path;
  }

  return path.replace(/\\/g, '/');
}
