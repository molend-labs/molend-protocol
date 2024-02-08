import { ethers } from 'ethers';
import { task } from 'hardhat/config';
import {
  getAllMockedTokens,
  getLendingPool,
  getLendingPoolAddressesProvider,
  getSigner,
  getUiPoolDataProvider,
  getWETHGateway,
} from '../../helpers/contracts-getters';
import { UiIncentiveDataProviderFactory } from '../../types';

task('dev:reserves', 'Show reserve data').setAction(async ({}, localBRE) => {
  await localBRE.run('set-DRE');

  const addressProvider = await getLendingPoolAddressesProvider();
  const poolDataProvider = await getUiPoolDataProvider();
  const result = await poolDataProvider.getReservesData(addressProvider.address);
  console.log(result);

  const list = await poolDataProvider.getReservesList(addressProvider.address);
  console.log(list);
});
