import { ethers } from 'ethers';
import { task } from 'hardhat/config';
import { getAaveOracle, getAllMockedTokens, getWETHGateway } from '../../helpers/contracts-getters';

task('dev:price', 'Get price from oracle').setAction(async ({}, localBRE) => {
  await localBRE.run('set-DRE');
  const mockTokens = await getAllMockedTokens();
  const weth = await getWETHGateway();
  mockTokens['WETH'] = weth as any;

  const tokenList = ['DAI', 'USDT', 'USDC', 'WETH', 'WBTC'];
  const aaveOracle = await getAaveOracle();

  for (const t of tokenList) {
    try {
      const token = mockTokens[t];
      const source = await aaveOracle.getSourceOfAsset(token.address);
      console.log(`token ${t} source ${source}`);
      const price = await aaveOracle.getAssetPrice(token.address);
      console.log(`token ${t} price ${price}`);
    } catch (err) {
      console.log(`failed to get price for ${t}`);
    }
  }
});
