export interface IOptions {
  targets?: string | string[] | Record<string, string>;
  configPath?: string;
  ignoreBrowserslistConfig?: boolean;
  browserslistEnv?: string;
}
