import type { IConfiguration, IPluginAPI } from './types';

export default function (api: IPluginAPI<IConfiguration>) {
  ['onStart', 'modifyConfig'].forEach(name => {
    api.registerMethod({
      name,
    });
  });
}
