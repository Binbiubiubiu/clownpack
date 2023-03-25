import { defineConfig } from "../../packages/cli/dist";

export default defineConfig({
  plugins: [["./custom-plugin.ts", { name: "Binbiubiubiu" }]],
});
