export enum CliCmd {
  dev = "dev",
  build = "build",
  prebundle = "prebundle",
}

export const SHORT_ENV: Record<string, string> = {
  development: "dev",
  production: "prod",
  test: "test",
};
