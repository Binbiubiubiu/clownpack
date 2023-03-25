import { colorette } from "@clownpack/helper";
import { ICommand } from "./types";
import { Service } from "./service";

export { showHelp, showHelps };

const COMMON_OPTIONS = {
  "-h, --help": "Print help information",
};

function showHelp(this: Service, subCommand: ICommand) {
  console.log();
  if (subCommand.description) {
    console.log(subCommand.description);
  }
  console.log();
  console.log(`Usage: ${colorette.magentaBright(this.frameworkName)} ${subCommand.name} [options]`);

  console.log();
  console.log("Options:");
  showOptions({
    ...COMMON_OPTIONS,
    ...subCommand.options,
  });

  if (subCommand.examples) {
    console.log();
    console.log("Examples:");
    for (const example of subCommand.examples) {
      console.log(`    $ ${colorette.greenBright(example)}`);
    }
  }
}

function showHelps(this: Service) {
  console.log();
  console.log(`Usage: ${colorette.magentaBright(this.frameworkName)} <COMMAND> [OPTIONS] `);

  console.log();
  showOptions(COMMON_OPTIONS);

  if (Object.keys(this.commands).length > 0) {
    console.log();
    console.log("Commands:");
    for (const name in this.commands) {
      const cmd = this.commands[name];
      if (name === "version" || cmd.isAlias) continue;

      const ps = 10 - name.length;
      console.log(`    ${colorette.greenBright(cmd.name)}${blank(ps)}${cmd.description}`);
    }
  }

  console.log();
  console.log(
    `See '${colorette.magentaBright(
      this.frameworkName,
    )} help <command>' for more information on a specific command.`,
  );
}

function blank(len: number) {
  return Array(len)
    .map(() => "")
    .join(" ");
}

function showOptions(options: Record<string, string>) {
  console.log("Options:");
  const maxLength =
    Object.keys(options).reduce((v1, v2) => {
      return v1.length > v2.length ? v1 : v2;
    }).length + 4;
  for (const key in options) {
    const value = options[key];
    const ps = maxLength - key.length;
    console.log(`    ${colorette.blueBright(key)}${blank(ps)}${value}`);
  }
}
