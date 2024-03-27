import { task } from 'hardhat/config';
import { getFirstSigner, getLendingPoolAddressesProvider } from '../../helpers/contracts-getters';
import { deployLendingPool } from '../../helpers/contracts-deployments';
import { waitForTx } from '../../helpers/misc-utils';

task('upgrade-pool', 'Upgrade LendingPool implementation')
  .addParam('provider', 'Lendingpool address provider address')
  .addParam('verify', 'Verify contracts')
  .setAction(async ({ verify, provider }, localBRE) => {
    await localBRE.run('set-DRE');
    const signer = await getFirstSigner();
    console.log('signer', await signer.getAddress());

    // deploy lending pool impl
    const lendingPoolImpl = await deployLendingPool(verify);
    console.log('New lending pool impl: ', lendingPoolImpl.address);

    // upgrade impl address via address provider
    const addressProvider = await getLendingPoolAddressesProvider(provider);
    await waitForTx(
      await addressProvider.connect(signer).setLendingPoolImpl(lendingPoolImpl.address)
    );

    console.log('Upgraded');
  });
