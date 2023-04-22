import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import dotenv from 'dotenv';
import { expand as dotenvExpand } from 'dotenv-expand';
import { LOCAL_EXT, SHORT_ENV } from './constants';

export { localEnvSuffix, loadEnv };

function localEnvSuffix(opts: { env: string; customEnv?: string }) {
  const filePaths: string[] = [LOCAL_EXT];
  const addFile = (name: string) => {
    filePaths.push(name, `${name}${LOCAL_EXT}`);
  };

  addFile(`.${opts.env}`);
  SHORT_ENV[opts.env] && addFile(`.${SHORT_ENV[opts.env]}`);
  opts.customEnv && addFile(`.${opts.env}.${opts.customEnv}`);
  SHORT_ENV[opts.env] && opts.customEnv && addFile(`.${SHORT_ENV[opts.env]}.${opts.customEnv}`);

  return filePaths;
}

function loadEnv(opts: { cwd: string; envFile: string; env: string; customEnv?: string }) {
  const { cwd, envFile, env, customEnv } = opts;
  const files = [
    join(cwd, envFile),
    ...localEnvSuffix({ env, customEnv }).map(suffix => join(cwd, `${envFile}${suffix}`)),
  ];
  for (const file of files) {
    if (!existsSync(file)) continue;
    const parsed = dotenv.parse(readFileSync(file));
    dotenvExpand({ ignoreProcessEnv: true, parsed });
    for (const key of Object.keys(parsed)) {
      process.env[key] = parsed[key];
    }
  }
}
