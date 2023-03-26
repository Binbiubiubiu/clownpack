import type { IApi, Configuration } from "@clownpack/cli";

export default (api: IApi) => {
  api.addPluginOptsSchema((z) => {
    return z.object({
      name: z.string(),
    });
  });
  api.onStart(() => {
    // console.log("onStart");
  });

  api.modifyConfig((config: Configuration) => {
    // console.log(config);
    return config;
  });
};
