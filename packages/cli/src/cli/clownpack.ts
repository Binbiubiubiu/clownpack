import { Logger, yParser } from "@clownpack/helper";
import { Service } from "@clownpack/core";
import { CliCmd, FRAMEWORK_NAME } from "../constants";
import { type Configuration, Env } from "../types";
import { printFrameworkInfo } from "./utils";

export async function run() {
  const args = yParser(process.argv.slice(2));

  let command = `${args._[0] ?? ""}`;

  switch (command) {
    case CliCmd.dev:
      process.env.NODE_ENV = Env.development;
      break;
    case CliCmd.build:
    case CliCmd.prebundle:
      process.env.NODE_ENV = Env.production;
  }

  if (process.env.DEBUG) {
    Logger.init(FRAMEWORK_NAME);
  }
  const service = new Service<Configuration>({
    frameworkName: FRAMEWORK_NAME,
    cwd: process.cwd(),
    env: process.env.NODE_ENV,
    plugins: [require.resolve("../preset")],
  });

  printFrameworkInfo();
  if (args.version || args.v) {
    command = "version";
  } else if (args.help || args.h || !command) {
    command = "help";
  }

  await service.run({
    command,
    args,
  });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
