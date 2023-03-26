import type { IApi } from "../types";
import { colorette } from "@clownpack/helper";
import type { Service, IConfiguration } from "@clownpack/core";

export default (api: IApi) => {
  api.registerCommand({
    name: "help",
    apply: () => {
      const { service, args } = api;
      const command = `${args._[0] || ""}`;

      if (command) {
        if (command in service.commands) {
          showHelp.call(service, command);
        } else {
          console.log(`Unknown command ${command}.`);
        }
      } else {
        showHelps.call(service);
      }
    },
  });
};

const COMMON_OPTIONS = {
  "-h, --help": "Print help information",
  "-v, --version": "Print the version number",
};

function showHelp<T extends IConfiguration>(this: Service<T>, command: string) {
  const cmd = this.commands[command];

  console.log();
  if (cmd.description) {
    console.log(cmd.description);
  }
  console.log();
  console.log(`Usage: ${colorette.magentaBright(this.frameworkName)} ${cmd.name} [options]`);

  console.log();
  console.log("Options:");
  showMap({
    ...COMMON_OPTIONS,
    ...cmd.options,
  });

  if (cmd.examples) {
    console.log();
    console.log("Examples:");
    for (const example of cmd.examples) {
      console.log(`    $ ${colorette.greenBright(example)}`);
    }
  }
}

function showHelps<T extends IConfiguration>(this: Service<T>) {
  console.log();
  console.log(`Usage: ${colorette.magentaBright(this.frameworkName)} <COMMAND> [OPTIONS] `);

  console.log();
  console.log("Options:");
  showMap(COMMON_OPTIONS);

  if (Object.keys(this.commands).length > 0) {
    console.log();
    console.log("Commands:");
    const map = Object.keys(this.commands).reduce((obj, name) => {
      const cmd = this.commands[name];
      if (cmd.isAlias) return obj;
      let alias = cmd.alias
        ? typeof cmd.alias === "string"
          ? cmd.alias
          : cmd.alias.join(",")
        : "";
      alias = alias ? `,${alias}` : "";
      if (cmd.description) {
        obj[`${cmd.name}${alias}`] = cmd.description;
      }
      return obj;
    }, {} as Record<string, string>);
    showMap(map);
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

function showMap(map: Record<string, string>) {
  const maxLength =
    Object.keys(map).reduce((v1, v2) => {
      return v1.length > v2.length ? v1 : v2;
    }).length + 4;
  for (const key in map) {
    const value = map[key];
    const ps = maxLength - key.length;
    console.log(`    ${colorette.blueBright(key)}${blank(ps)}${value}`);
  }
}
