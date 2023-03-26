import { FRAMEWORK_VERSION } from "../constants";
import { IApi } from "../types";

export default (api: IApi) => {
  api.registerCommand({
    name: "version",
    apply: () => {
      console.log();
      console.log(FRAMEWORK_VERSION);
      return FRAMEWORK_VERSION;
    },
  });
};
