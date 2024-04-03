// import BigNumber from 'bignumber.js';
// import { oneRay } from '../../helpers/constants';
import { eContractid, IReserveParams } from '../../helpers/types';
import {
  rateStrategyWETH,
  rateStrategyUSDC,
  rateStrategyUSDT,
  rateStrategyWSTETH,
  rateStrategySTONE,
  rateStrategyEZETH,
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

export const strategyWSTETH: IReserveParams = {
  strategy: rateStrategyWSTETH,
  baseLTVAsCollateral: '6500',
  liquidationThreshold: '7000',
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
