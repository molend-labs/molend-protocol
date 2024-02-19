import { IModeConfiguration, eModeNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
import {
  strategyDAI,
  strategyUSDC,
  strategyUSDT,
  strategyWBTC,
  strategyWETH,
} from './reservesConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const ModeConfig: IModeConfiguration = {
  ...CommonsConfig,
  MarketId: 'Mode Market',
  ProviderId: 3,
  ReservesConfig: {
    DAI: strategyDAI,
    USDC: strategyUSDC,
    USDT: strategyUSDT,
    WBTC: strategyWBTC,
    WETH: strategyWETH,
  },
  // TODO mode
  ReserveAssets: {
    [eModeNetwork.mode]: {
      USDT: '0x5306023Eb69ee9dDd5e8a54eA63007f7D984071F',
      WETH: '0xcc9ffcfBDFE629e9C62776fF01a75235F466794E',
      WBTC: '0x896088e846cCE3751Aa6F6E8001C36aA1b5FC57a',
    },
  },
};

export default ModeConfig;
