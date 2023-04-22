import { defineConfig } from '@clownpack/cli';

export default defineConfig({
  runner: 'webpack',
  input: 'src/index.ts',
  output: {
    format: 'esm',
  },
  plugins: [['./custom-plugin.ts', { name: 'Binbiubiubiu' }]],
});
