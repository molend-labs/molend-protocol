import { task } from 'hardhat/config';
import { checkVerification } from '../../helpers/etherscan-verification';
import { ConfigNames } from '../../helpers/configuration';
import { printContracts } from '../../helpers/misc-utils';
import { usingTenderly } from '../../helpers/tenderly-utils';

task('dev:print', 'Print contracts').setAction(async ({}, DRE) => {
  await DRE.run('set-DRE');
  printContracts();
});
