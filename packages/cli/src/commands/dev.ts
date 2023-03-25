import { IApi } from "../types";

export default (api: IApi) => {
  api.registerCommand({
    name: "dev",
    description: "Start build in watch mode",
    apply: ({ args }) => {
      console.log(args);
    },
  });
};
