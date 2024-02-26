import { ethers } from 'ethers';
import { task } from 'hardhat/config';
import { getAaveOracle, getAllMockedTokens, getWETHGateway } from '../../helpers/contracts-getters';

task('dev:price', 'Get price from oracle')
  .addParam("asset", "Asset address")
  .setAction(async ({ asset }, localBRE) => {
    await localBRE.run('set-DRE');
    const aaveOracle = await getAaveOracle();

    try {
      const source = await aaveOracle.getSourceOfAsset(asset);
      console.log(`token ${asset} source ${source}`);
      const price = await aaveOracle.getAssetPrice(asset);
      console.log(`token ${asset} price ${price}`);
    } catch (err) {
      console.log(`failed to get price for ${asset}`);
    }
  });
