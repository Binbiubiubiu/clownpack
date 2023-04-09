import { definePlugin } from "../define";

export default definePlugin((api) => {
  api.registerCommand({
    name: "build",
    alias: ["b"],
    description: "Build the current package",
    apply: () => {
      const { runner } = api.config;
      if (!runner) {
        throw new Error("need runner");
      }
      const runnerPath = require.resolve(`../runner/${api.config.runner}`);
      require(runnerPath).build(api);
    },
  });
});
