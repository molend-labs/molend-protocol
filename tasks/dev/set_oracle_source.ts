import { ethers } from 'ethers';
import { task } from 'hardhat/config';
import { getAaveOracle, getSigner } from '../../helpers/contracts-getters';
import { waitForTx } from '../../helpers/misc-utils';

task('dev:set-source', 'Set oracle source').setAction(async ({}, localBRE) => {
  await localBRE.run('set-DRE');
  const signer0 = await getSigner(0);
  console.log(await signer0.getAddress());

  const asset = process.env['ASSET'];
  const source = process.env['NEWSOURCE'];

  if (!asset || !source) {
    console.log('asset or source is missing');
    return;
  }

  const aaveOracle = await getAaveOracle();

  await waitForTx(await aaveOracle.connect(signer0).setAssetSources([asset], [source]));

  console.log(`set asset ${asset} source to ${source}`);
});
