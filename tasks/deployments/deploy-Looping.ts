import { task } from 'hardhat/config';

import { verifyContract } from '../../helpers/contracts-helpers';
import { eContractid } from '../../helpers/types';
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

    const looping = await deployLooping(provider, weth);
    await looping.deployTransaction.wait();
    console.log(`${CONTRACT_NAME}.address`, looping.address);

    if (verify) {
      await verifyContract(eContractid.Looping, looping, [provider, weth]);
    }

    console.log(`\tFinished ${CONTRACT_NAME} contract deployment`);
  });
