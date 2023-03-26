export { FRAMEWORK_NAME, CliCmd, SHORT_ENV, FRAMEWORK_VERSION };

const FRAMEWORK_NAME = "clownpack";
const FRAMEWORK_VERSION: string = require("../package.json").version;

enum CliCmd {
  dev = "dev",
  build = "build",
  prebundle = "prebundle",
}

const SHORT_ENV: Record<string, string> = {
  development: "dev",
  production: "prod",
  test: "test",
};
