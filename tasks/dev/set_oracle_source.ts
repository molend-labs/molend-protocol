import { ethers } from 'ethers';
import { task } from 'hardhat/config';
import { getAaveOracle, getSigner } from '../../helpers/contracts-getters';
import { waitForTx } from '../../helpers/misc-utils';

task('dev:set-source', 'Set oracle source')
  .addParam("asset", "asset address")
  .addParam("source", "oracle address")
  .setAction(async ({ asset, source }, localBRE) => {
    await localBRE.run('set-DRE');
    const signer0 = await getSigner(0);
    console.log(await signer0.getAddress());

    const aaveOracle = await getAaveOracle();

    await waitForTx(await aaveOracle.connect(signer0).setAssetSources([asset], [source]));

    console.log(`set asset ${asset} source to ${source}`);
  });
