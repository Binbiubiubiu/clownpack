import { colorette } from '@clownpack/helper';
import { FRAMEWORK_NAME, FRAMEWORK_VERSION } from '../constants';

export { printFrameworkInfo };

function printFrameworkInfo() {
  console.log(`${'🤡'} ${colorette.magentaBright(FRAMEWORK_NAME)} v${FRAMEWORK_VERSION}`);
}
