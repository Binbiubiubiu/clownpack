import path from 'path';

/**
 *
 * @public
 */
export const presetPkgPath = path.join(__dirname, '..');

/**
 *
 * @public
 */
export function getCorejsVersion() {
  try {
    return getDepVersion('core-js')
      .split('.')
      .shift()
      .replace(/[^0-9]/gi, '');
  } catch {
    return '3';
  }
}

export function getDepVersion(name: string) {
  const pkg = require(path.join(presetPkgPath, 'package.json'));
  return pkg.dependencies[name];
}
