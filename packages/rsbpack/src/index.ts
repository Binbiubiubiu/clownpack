import type { IConfiguration } from "@clownpack/core";

export { build };

interface BuildOptions<T extends IConfiguration> {
  userConfig: T;
}

function build<T extends IConfiguration>(opts: BuildOptions<T>) {}
