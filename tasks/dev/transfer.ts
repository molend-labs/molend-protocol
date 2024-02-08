import { ethers } from 'ethers';
import { task } from 'hardhat/config';
import {
  getAllMockedTokens,
  getMintableERC20,
  getSigner,
  getWETHMocked,
} from '../../helpers/contracts-getters';
import { waitForTx } from '../../helpers/misc-utils';

task('dev:transfer', 'Transfer coins').setAction(async ({}, localBRE) => {
  await localBRE.run('set-DRE');
  const mockTokens = await getAllMockedTokens();
  const tokenList = ['DAI', 'USDT', 'USDC', 'WBTC', 'WETH'];

  const weth = await getWETHMocked();
  mockTokens['WETH'] = weth as any;

  const signer = await getSigner(0);
  const receipt = process.env.RECEIPT;
  if (!receipt) {
    console.log('missing receipt in env');
    return;
  }

  for (const t of tokenList) {
    const token = mockTokens[t];
    let amount = ethers.utils.parseUnits('100');
    if (t === 'USDT' || t === 'USDC' || t === 'WBTC') {
      amount = ethers.utils.parseUnits('0.001');
    }

    await waitForTx(
      await token.connect(signer).transfer(receipt, amount, {
        gasLimit: 1000000,
        gasPrice: 0,
      })
    );

    console.log(`Transferred ${t} to ${receipt}`);
  }
});
