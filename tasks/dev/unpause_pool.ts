import { ethers } from 'ethers';
import { task } from 'hardhat/config';
import { getAllMockedTokens, getLendingPool, getLendingPoolConfiguratorProxy, getMintableERC20, getSigner } from '../../helpers/contracts-getters';
import { waitForTx } from '../../helpers/misc-utils';

task('dev:unpause', 'Mint some stable coins')
  .setAction(async ({}, localBRE) => {
    await localBRE.run('set-DRE');

    const signer = await getSigner(0);
    console.log(await signer.getAddress());

    const pool = await getLendingPoolConfiguratorProxy();

    await waitForTx(
      await pool.setPoolPause(false)
    );

    console.log('set pool paused to false');

  });
