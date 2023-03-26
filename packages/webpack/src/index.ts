import { IConfiguration } from "@clownpack/core";
import Config from "webpack-chain";
import webpack from "webpack";

export { build };

interface BuildOptions<T extends IConfiguration> {
  userConfig: T;
}

function build<T extends IConfiguration>(opts?: BuildOptions<T>) {
  console.log("webpack build");
  const chain = new Config();
  chain.entry("umd-name").add("./src/index.ts");
  const webpackConfig = chain.toConfig();
  const compiler = webpack(webpackConfig);
  compiler.run((stats) => {});
  compiler.close(() => {});
  console.log();
}

build();
