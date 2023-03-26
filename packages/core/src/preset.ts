import type { IPluginAPI } from "./types";

export default (api: IPluginAPI) => {
  ["onStart", "modifyConfig"].forEach((name) => {
    api.registerMethod({
      name,
    });
  });
};
