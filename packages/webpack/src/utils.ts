import path from "path";
import { DEFAULT_CACHE_DIRECTORY } from "./constants";

export function getDefaultCacheDirectory(cwd: string) {
  return path.join(cwd, "node_modules", ".cache", DEFAULT_CACHE_DIRECTORY);
}
