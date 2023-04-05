import { resolveSync } from "@clownpack/helper";
import { definePlugin } from "./define";

export default definePlugin((api) => {
  return {
    plugins: [
      resolveSync("./commands/version"),
      resolveSync("./commands/help"),

      resolveSync("./commands/dev"),
      resolveSync("./commands/build"),
    ],
  };
});
