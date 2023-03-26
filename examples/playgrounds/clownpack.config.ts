import { defineConfig } from "@clownpack/cli";

export default defineConfig({
  plugins: [["./custom-plugin.ts", { name: "Binbiubiubiu" }]],
  executor: "webpack",
});
