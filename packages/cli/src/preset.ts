import { IApi } from "@clownpack/service";

export default (api: IApi) => {
  return {
    plugins: [require.resolve("./commands/dev.ts"), require.resolve("./commands/build.ts")],
  };
};
