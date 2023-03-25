import type { IApi, IRpConfig } from "clownpack";

export default (api: IApi) => {
  api.addPluginOptsSchema((joi) => {
    return joi.object({
      name: joi.string(),
    });
  });
  api.onStart(() => {
    console.log("onStart");
  });
  api.modifyConfig((initialValue: IRpConfig) => {
    return initialValue;
  });
};
