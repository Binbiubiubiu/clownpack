import type { IApi } from "./types";

export default (api: IApi) => {
  return {
    plugins: [
      require.resolve("./commands/version"),
      require.resolve("./commands/help"),

      require.resolve("./commands/dev"),
      require.resolve("./commands/build"),
    ],
  };
};
