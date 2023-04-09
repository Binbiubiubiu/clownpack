import { defineConfig } from "@clownpack/cli";

export default defineConfig({
  runner: "bundless",
  input: "src/index.ts",
  output: {
    format: "esm",
  },
  targets: [],
  plugins: [["./custom-plugin.ts", { name: "Binbiubiubiu" }]],
});
