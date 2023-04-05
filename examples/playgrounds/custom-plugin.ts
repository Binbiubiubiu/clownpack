import { definePlugin } from "@clownpack/cli";

export default definePlugin((api) => {
  api.addPluginOptsSchema((z) => {
    return z.object({
      name: z.string(),
    });
  });
  api.onStart(() => {
    console.log("onStart");
  });

  api.modifyConfig((config) => {
    console.log(config);
    return config;
  });
});
