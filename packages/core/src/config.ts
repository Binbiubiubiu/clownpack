import { join } from "path";
import { existsSync } from "fs";
import { DEFAULT_CONFIG_EXTENSIONS, DEFAULT_FRAMEWORK_NAME, DEFAULT_NODE_ENV } from "./constants";
import { merge, createEsbuildRegister, getModuleDefaultExport } from "@clownpack/helper";
import { localEnvSuffix } from "./utils";

interface IConfigOptions {
  name: string;
  cwd: string;
  env: string;
  customEnv?: string;
  exts: string[];
  defaultConfigFiles?: string[] | ((ext: string) => string);
}

export interface IConfigProvider<T> {
  getUserConfig(): T;
  getConfigFiles(): string[];
}

export class DefaultConfigProvider<T> implements IConfigProvider<T> {
  private baseConfigFile: string | null = null;
  private readonly options: IConfigOptions;
  constructor(options?: Partial<IConfigOptions>) {
    this.options = {
      name: DEFAULT_FRAMEWORK_NAME,
      cwd: process.cwd(),
      env: DEFAULT_NODE_ENV,
      exts: DEFAULT_CONFIG_EXTENSIONS,
      ...options,
    };
  }

  getUserConfig(): T {
    let config = {} as T;
    const configFiles = this.getConfigFiles();
    const unregister = createEsbuildRegister({
      hookMatcher: (fileName) => configFiles.includes(fileName),
    });
    for (const file of configFiles) {
      config = merge(config, getModuleDefaultExport(require(file)));
    }
    for (const file of configFiles) {
      if (require.cache[file]) {
        delete require.cache[file];
      }
    }
    unregister();
    return config;
  }

  getConfigFiles(): string[] {
    const { env, cwd, name, customEnv, exts, defaultConfigFiles: dfs } = this.options;
    const resolveDefaultConfigFile =
      typeof dfs === "function" ? dfs : (ext: string) => `${name}.config${ext}`;
    const defaultConfigFiles = Array.isArray(dfs)
      ? dfs
      : exts.map((ext) => resolveDefaultConfigFile(ext));
    for (const configFile of defaultConfigFiles) {
      const absConfigPath = join(cwd, configFile);
      if (existsSync(absConfigPath)) {
        this.baseConfigFile = absConfigPath;
        break;
      }
    }

    const addExt = (ext: string) => {
      const file = this.baseConfigFile;
      if (file) {
        const i = file.lastIndexOf(".");
        return file.slice(0, i) + ext + file.slice(i);
      }
      return null;
    };

    const configFiles: string[] = [];
    if (this.baseConfigFile) {
      configFiles.push(
        this.baseConfigFile,
        ...localEnvSuffix({ env, customEnv })
          .map((ext) => addExt(ext) || "")
          .filter(existsSync),
      );
    }
    return configFiles;
  }
}
