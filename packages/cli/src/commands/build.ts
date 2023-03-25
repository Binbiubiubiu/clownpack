import { IApi } from "../types";

export default (api: IApi) => {
  api.registerCommand({
    name: "build",
    alias: ["b"],
    description: "Build the current package",
    apply: ({ args }) => {
      console.log(args);
    },
  });
};
