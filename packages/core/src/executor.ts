import { IConfiguration } from "./types";

export interface IExecutor<R> {
  (opts: {
    userConfig: IConfiguration;
    cwd: string;
    env: string;
  }): Promise<R>;
}
