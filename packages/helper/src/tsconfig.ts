import { loadConfig } from 'tsconfig-paths';
import * as MappingEntry from 'tsconfig-paths/lib/mapping-entry';
import { slash } from './path';
import path from 'path';

export { getTsconfig } from 'get-tsconfig';

/**
 *
 * @public
 */
export function getAliasFromTsconfig(cwd: string = process.cwd()) {
  const config = loadConfig(cwd);
  const alias: Record<string, string[]> = {};
  if (config.resultType === 'success') {
    const { absoluteBaseUrl, paths, addMatchAll } = config;
    const mappings = MappingEntry.getAbsoluteMappingEntries(absoluteBaseUrl, paths, !!addMatchAll);

    const removeAllChar = (t: string) => slash(t).replace(/\/\*$/, '');
    for (const entry of mappings) {
      // ignore default entry
      if (entry.pattern === '*') continue;
      const name = removeAllChar(entry.pattern);
      const paths = entry.paths.map(removeAllChar);
      alias[name] = paths;
    }
    return alias;
  }
  return alias;
}
