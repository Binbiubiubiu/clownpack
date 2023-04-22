import { definePlugin } from '../define';

export default definePlugin(api => {
  api.registerCommand({
    name: 'dev',
    description: 'Start build in watch mode',
    apply: () => {
      console.log(api.args);
    },
  });
});
