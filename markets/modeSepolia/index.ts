
import { IModeConfiguration, eModeNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
import {
  strategySTONE,
  strategyUSDC,
  strategyUSDT,
  strategyWETH,
  strategyWSTETH,
} from './reservesConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const ModeSepoliaConfig: IModeConfiguration = {
  ...CommonsConfig,
  MarketId: 'Mode Market',
  ProviderId: 3,
  ReservesConfig: {
    USDC: strategyUSDC,
    USDT: strategyUSDT,
    WETH: strategyWETH,
    WSTETH: strategyWSTETH,
    STONE: strategySTONE,
  },
  // TODO mode
  ReserveAssets: {
    [eModeNetwork.modeSepolia]: {
      USDC: '0x6c6D1ebabc51a9E0Cd1E87124645B028417c90c4',
      USDT: '0x5306023Eb69ee9dDd5e8a54eA63007f7D984071F',
      WETH: '0xcc9ffcfBDFE629e9C62776fF01a75235F466794E',
      WBTC: '0x896088e846cCE3751Aa6F6E8001C36aA1b5FC57a',
      WSTETH: '0xE00B04ae0d63B8D304E1C849489B013AD559F050',
      STONE: '0xd3284Df9FE2536AFaC2b1Bd57FA66b2c45eA1B74',
    },
  },
};

export default ModeSepoliaConfig;
