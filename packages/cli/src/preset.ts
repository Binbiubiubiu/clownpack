import { definePlugin } from './define';

export default definePlugin(api => {
  return {
    plugins: [
      require.resolve('./commands/version'),
      require.resolve('./commands/help'),
      require.resolve('./commands/dev'),
      require.resolve('./commands/build'),

      require.resolve('./methods/webpack'),
    ],
  };
});
