import { ethers } from 'ethers';
import { task } from 'hardhat/config';
import { ConfigNames, loadPoolConfig } from '../../helpers/configuration';
import {
  getAllMockedTokens,
  getLendingPool,
  getLendingPoolAddressesProvider,
  getSigner,
  getUiPoolDataProvider,
  getWETHGateway,
} from '../../helpers/contracts-getters';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import { eModeNetwork, ICommonConfiguration } from '../../helpers/types';
import { UiIncentiveDataProviderFactory } from '../../types';

task('dev:info', 'Show user and reserve info').setAction(async ({}, localBRE) => {
  await localBRE.run('set-DRE');
  const signer0 = await getSigner(0);
  const signer1 = await getSigner(1);
  const pool = await getLendingPool();

  console.log(`Signer 0 addr: ${await signer0.getAddress()}`);
  console.log(`Signer 1 addr: ${await signer1.getAddress()}`);


  const poolConfig = loadPoolConfig(ConfigNames.Mode);
  const { ReserveAssets } = poolConfig as ICommonConfiguration;
  const reserveAssets = await getParamPerNetwork(ReserveAssets, eModeNetwork.mode);
  const tokenMap = {};
  for (const symbol of Object.keys(reserveAssets)) {
    tokenMap[reserveAssets[symbol].toLowerCase()] = symbol;
  }

  const reservesList = await pool.getReservesList();
  for (const reserve of reservesList) {
    const reserveData = await pool.getReserveData(reserve);
    console.log(`\nReserve Data: ${tokenMap[reserve.toLowerCase()] || 'WETH'}`);
    console.log(`Reserve address: ${reserve}`);
    console.log(`aToken address: ${reserveData.aTokenAddress}`);
    console.log(`vToken address: ${reserveData.variableDebtTokenAddress}`);
  }
  console.log();

  const uiProvider = await getUiPoolDataProvider();
  const addressProvider = await getLendingPoolAddressesProvider();
  const reservesData = await uiProvider.getReservesData(addressProvider.address);
  console.log(reservesData);

  const userAccount = await pool.getUserAccountData(await signer1.getAddress());
  console.log('totalCollateralETH', userAccount.totalCollateralETH.toString());
  console.log('availableBorrowsETH', userAccount.availableBorrowsETH.toString());

  // const wbtc = await pool.getReserveData('0x5CAe380B9EC05556d5B0D90DcF39c4724DCEB670');

  const paused = await pool.paused();
  console.log('\n paused', paused);

  const wethGateway = await getWETHGateway();
  const wethAddr = await wethGateway.getWETHAddress();
  console.log(`weth addr: ${wethAddr}`);
});
