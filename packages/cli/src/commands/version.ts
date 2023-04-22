import { FRAMEWORK_VERSION } from '../constants';
import { definePlugin } from '../define';

export default definePlugin(api => {
  api.registerCommand({
    name: 'version',
    apply: () => {
      console.log();
      console.log(FRAMEWORK_VERSION);
      return FRAMEWORK_VERSION;
    },
  });
});
