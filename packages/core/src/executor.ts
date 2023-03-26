import { IConfiguration } from "./types";

export interface IExecutor<R> {
  build(opts: {
    userConfig: IConfiguration;
    cwd: string;
    env: string;
  }): Promise<R>;
}
