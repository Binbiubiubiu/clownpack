import type { IApi, Configuration } from "@clownpack/cli";

export default (api: IApi) => {
  api.addPluginOptsSchema((joi) => {
    return joi.object({
      name: joi.string(),
    });
  });
  api.onStart(() => {
    console.log("onStart");
  });
  api.modifyConfig((initialValue: Configuration) => {
    return initialValue;
  });
};
