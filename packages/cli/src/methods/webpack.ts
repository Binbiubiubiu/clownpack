import { definePlugin } from "../define";

export default definePlugin((api) => {
  ["chainWebpack", "modifyWebpackConfig"].forEach((name) => {
    api.registerMethod({
      name,
    });
  });
});
