import { task } from 'hardhat/config';
import { getFirstSigner } from '../../helpers/contracts-getters';
import { registerContractInJsonDb } from '../../helpers/contracts-helpers';
import { waitForTx } from '../../helpers/misc-utils';
import { WETH9MockedFactory } from '../../types';

task('dev:weth', 'Deploy WETH').setAction(async ({}, localBRE) => {
  await localBRE.run('set-DRE');
  const signer = await getFirstSigner();

  const weth = new WETH9MockedFactory(signer);
  const instance = await weth.deploy();
  await waitForTx(instance.deployTransaction);
  await registerContractInJsonDb('WETHMocked', instance);

  console.log('WETH deployed to', instance.address);
});
