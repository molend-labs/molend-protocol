import BigNumber from 'bignumber.js';
import { oneRay } from '../../helpers/constants';
import { IInterestRateStrategyParams } from '../../helpers/types';

// USDC 
export const rateStrategyUSDC: IInterestRateStrategyParams = {
  name: "rateStrategyUSDC",
  optimalUtilizationRate: new BigNumber(0.25).multipliedBy(oneRay).toFixed(),
  baseVariableBorrowRate: new BigNumber(0).multipliedBy(oneRay).toFixed(),
  variableRateSlope1: new BigNumber(0.15).multipliedBy(oneRay).toFixed(),
  variableRateSlope2: new BigNumber(1).multipliedBy(oneRay).toFixed(),
  stableRateSlope1: '0',
  stableRateSlope2: '0',
};

// USDT
export const rateStrategyUSDT: IInterestRateStrategyParams = {
  name: "rateStrategyUSDT",
  optimalUtilizationRate: new BigNumber(0.25).multipliedBy(oneRay).toFixed(),
  baseVariableBorrowRate: new BigNumber(0).multipliedBy(oneRay).toFixed(),
  variableRateSlope1: new BigNumber(0.15).multipliedBy(oneRay).toFixed(),
  variableRateSlope2: new BigNumber(1).multipliedBy(oneRay).toFixed(),
  stableRateSlope1: '0',
  stableRateSlope2: '0',
};

// WETH
export const rateStrategyWETH: IInterestRateStrategyParams = {
  name: "rateStrategyWETH",
  optimalUtilizationRate: new BigNumber(0.2).multipliedBy(oneRay).toFixed(),
  baseVariableBorrowRate: new BigNumber(0).multipliedBy(oneRay).toFixed(),
  variableRateSlope1: new BigNumber(0.1).multipliedBy(oneRay).toFixed(),
  variableRateSlope2: new BigNumber(1).multipliedBy(oneRay).toFixed(),
  stableRateSlope1: '0',
  stableRateSlope2: '0',
};

// STONE
export const rateStrategySTONE: IInterestRateStrategyParams = {
  name: "rateStrategySTONE",
  optimalUtilizationRate: new BigNumber(0.3).multipliedBy(oneRay).toFixed(),
  baseVariableBorrowRate: new BigNumber(0).multipliedBy(oneRay).toFixed(),
  variableRateSlope1: new BigNumber(0.15).multipliedBy(oneRay).toFixed(),
  variableRateSlope2: new BigNumber(2).multipliedBy(oneRay).toFixed(),
  stableRateSlope1: '0',
  stableRateSlope2: '0',
};
