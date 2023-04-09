/**
 * @public
 */
export function useEsbuildRegisterEffect(
  effect: () => void,
  ids?: string[],
  overrides?: Parameters<typeof import("esbuild-register/dist/node").register>[0],
) {
  const esbuild: typeof import("esbuild-register/dist/node") = require("esbuild-register/dist/node");
  const { unregister } = esbuild.register({
    ...(Array.isArray(ids) && { hookMatcher: (fileName) => ids.includes(fileName) }),
    ...overrides,
  });
  effect();
  if (Array.isArray(ids)) {
    for (const id of ids) {
      delete require.cache[id];
    }
  }
  unregister();
}
