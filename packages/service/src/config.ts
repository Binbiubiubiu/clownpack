import { join } from "path";
import { existsSync } from "fs";
import { DEFAULT_CONFIG_EXTENSIONS } from "./constants";
import { merge, createEsbuildRegister, getModuleDefaultExport } from "@clownpack/helper";
import { localEnvSuffix } from "./utils";

interface IConfigOptions {
  cwd: string;
  env: string;
  name: string;
  customEnv?: string;
}

export class ConfigService {
  baseConfigFile: string | null = null;
  constructor(public readonly options: IConfigOptions) {}

  getUserConfig() {
    let config = {};
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

  private getConfigFiles() {
    const { env, cwd, name, customEnv } = this.options;
    const defaultConfigFiles = DEFAULT_CONFIG_EXTENSIONS.map((ext) => `${name}.config${ext}`);
    for (const configFile of defaultConfigFiles) {
      const absConfigPath = join(cwd, configFile);
      if (existsSync(absConfigPath)) {
        this.baseConfigFile = absConfigPath;
        break;
      }
    }

    const configFiles: string[] = [];
    if (this.baseConfigFile) {
      configFiles.push(
        this.baseConfigFile,
        ...localEnvSuffix({ env, customEnv })
          .map((ext) => this.getEnvConfigFile(ext) || "")
          .filter(existsSync),
      );
    }
    return configFiles;
  }

  private getEnvConfigFile(ext: string) {
    const file = this.baseConfigFile;
    if (file) {
      const i = file.lastIndexOf(".");
      return file.slice(0, i) + ext + file.slice(i);
    }
    return null;
  }
}
