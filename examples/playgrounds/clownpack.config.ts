import { defineConfig } from "@clownpack/cli";

export default defineConfig({
  plugins: [["./custom-plugin.ts", { name: "Binbiubiubiu" }], "@clownpack/webpack"],
  input: "./src/index.ts",
  module: "umd",
  browerslist: "defaults",
});
