import { yParser } from "@clownpack/helper";
import { Service } from "@clownpack/core";
import { CliCmd } from "../constants";
import { Env, Configuration } from "../types";

export async function run() {
  const args = yParser(process.argv.slice(2));

  const command = args._[0] ?? "";

  switch (command as CliCmd) {
    case CliCmd.dev:
      process.env.NODE_ENV = Env.development;
      break;
    case CliCmd.build:
    case CliCmd.prebundle:
      process.env.NODE_ENV = Env.production;
  }

  const service = new Service<Configuration>({
    cwd: process.cwd(),
    env: process.env.NODE_ENV,
    plugins: [require.resolve("../preset")],
  });

  await service.run({
    name: `${command}`,
    args,
  });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
