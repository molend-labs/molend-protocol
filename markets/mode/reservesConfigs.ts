// import BigNumber from 'bignumber.js';
// import { oneRay } from '../../helpers/constants';
import { eContractid, IReserveParams } from '../../helpers/types';
import {
  rateStrategyWETH,
  rateStrategyUSDC,
  rateStrategyUSDT,
  rateStrategySTONE,
  rateStrategyEZETH,
  rateStrategyMBTC,
  rateStrategyMODE,
} from './rateStrategies';

export const strategyUSDC: IReserveParams = {
  strategy: rateStrategyUSDC,
  baseLTVAsCollateral: '8000',
  liquidationThreshold: '8500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '6500',
};

export const strategyUSDT: IReserveParams = {
  strategy: rateStrategyUSDT,
  baseLTVAsCollateral: '8000',
  liquidationThreshold: '8500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '6500',
};

export const strategyWETH: IReserveParams = {
  strategy: rateStrategyWETH,
  baseLTVAsCollateral: '7000',
  liquidationThreshold: '7500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '6500',
};

export const strategySTONE: IReserveParams = {
  strategy: rateStrategySTONE,
  baseLTVAsCollateral: '3000',
  liquidationThreshold: '3500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '6500',
};

export const strategyEZETH: IReserveParams = {
  strategy: rateStrategyEZETH,
  baseLTVAsCollateral: '3000',
  liquidationThreshold: '3500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '6500',
};

export const strategyMBTC: IReserveParams = {
  strategy: rateStrategyMBTC,
  baseLTVAsCollateral: '0',  // use as collateral disabled
  liquidationThreshold: '0',
  liquidationBonus: '0',
  borrowingEnabled: false,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '6500',
};

export const strategyMODE: IReserveParams = {
  strategy: rateStrategyMODE,
  baseLTVAsCollateral: '5000',
  liquidationThreshold: '5500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '6500',
};
