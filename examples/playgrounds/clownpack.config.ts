import { defineConfig } from "@clownpack/cli";

export default defineConfig({
  input: "src/index.ts",
  format: "esm",
  plugins: [["./custom-plugin.ts", { name: "Binbiubiubiu" }]],
  runner: "webpack",
});
