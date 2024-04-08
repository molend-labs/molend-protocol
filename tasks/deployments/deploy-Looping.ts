import { task } from 'hardhat/config';

import { deployLooping } from '../../helpers/contracts-deployments';

const CONTRACT_NAME = 'Looping';

task(`deploy-${CONTRACT_NAME}`, `Deploys the ${CONTRACT_NAME} contract`)
  .addParam('provider', 'Address of the LendingPoolAddressesProvider')
  .addParam('weth', 'Address of the weth token')
  .addFlag('verify', `Verify ${CONTRACT_NAME} contract via Etherscan API.`)
  .setAction(async ({ provider, weth, verify }, localBRE) => {
    await localBRE.run('set-DRE');

    if (!localBRE.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }

    console.log(`\n- ${CONTRACT_NAME} deployment`);

    const looping = await deployLooping([provider, weth], verify);

    console.log(`${CONTRACT_NAME}.address`, looping.address);
    console.log(`\tFinished ${CONTRACT_NAME} contract deployment`);
  });
