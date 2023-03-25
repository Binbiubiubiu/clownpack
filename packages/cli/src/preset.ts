import { IApi } from "./types";

export default (api: IApi) => {
  return {
    plugins: [require.resolve("./commands/dev"), require.resolve("./commands/build")],
  };
};
