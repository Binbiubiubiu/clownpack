import { defineConfig } from "@clownpack/cli";

export default defineConfig({
  input: "src/index.ts",
  module: "umd",

  plugins: [["./custom-plugin.ts", { name: "Binbiubiubiu" }]],
});
