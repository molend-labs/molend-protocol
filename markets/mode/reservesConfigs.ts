// import BigNumber from 'bignumber.js';
// import { oneRay } from '../../helpers/constants';
import { eContractid, IReserveParams } from '../../helpers/types';
import {
  rateStrategyStableThree,
  rateStrategyWETH,
  rateStrategyAAVE,
  rateStrategyVolatileOne,
  rateStrategyVolatileTwo,
  rateStrategyDAI,
  rateStrategyUSDC,
  rateStrategyUSDT,
  rateStrategyWBTC,
} from './rateStrategies';

export const strategyDAI: IReserveParams = {
  strategy: rateStrategyDAI,
  baseLTVAsCollateral: '6500',
  liquidationThreshold: '7000',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '1500',
};

export const strategyUSDC: IReserveParams = {
  strategy: rateStrategyUSDC,
  baseLTVAsCollateral: '8500',
  liquidationThreshold: '9000',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '1500',
};

export const strategyUSDT: IReserveParams = {
  strategy: rateStrategyUSDT,
  baseLTVAsCollateral: '8000',
  liquidationThreshold: '8500',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '1500',
};

export const strategyWETH: IReserveParams = {
  strategy: rateStrategyWETH,
  baseLTVAsCollateral: '7000',
  liquidationThreshold: '7500',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '2500',
};

export const strategyWBTC: IReserveParams = {
  strategy: rateStrategyWBTC,
  baseLTVAsCollateral: '6500',
  liquidationThreshold: '7000',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '8',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '2500',
};

export const strategyMATIC: IReserveParams = {
  strategy: rateStrategyVolatileOne, //Temp?
  baseLTVAsCollateral: '5000',
  liquidationThreshold: '6500',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '2000',
};

export const strategyAAVE: IReserveParams = {
  strategy: rateStrategyAAVE,
  baseLTVAsCollateral: '5000',
  liquidationThreshold: '6500',
  liquidationBonus: '11000',
  borrowingEnabled: false,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '0',
};
