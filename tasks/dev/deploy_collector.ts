import { task } from 'hardhat/config';
import { getFirstSigner } from '../../helpers/contracts-getters';
import { registerContractInJsonDb } from '../../helpers/contracts-helpers';
import { waitForTx } from '../../helpers/misc-utils';
import { AaveCollectorFactory } from '../../types';

task('dev:collector', 'Deploy Aave Collector').setAction(async ({}, localBRE) => {
  await localBRE.run('set-DRE');
  const signer = await getFirstSigner();
  const aaveCollector = new AaveCollectorFactory(signer);
  const instance = await aaveCollector.deploy();
  await waitForTx(instance.deployTransaction);
  await registerContractInJsonDb('AaveCollector', instance);

  console.log('AaveCollector deployed:', instance.address);
});
