import { resolveSync } from "@clownpack/helper";
import type { IApi } from "./types";

export default (api: IApi) => {
  return {
    plugins: [
      resolveSync("./commands/version"),
      resolveSync("./commands/help"),

      resolveSync("./commands/dev"),
      resolveSync("./commands/build"),
    ],
  };
};
