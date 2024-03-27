import { IModeConfiguration, eModeNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
import {
  strategySTONE,
  strategyUSDC,
  strategyUSDT,
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
    USDC: strategyUSDC,
    USDT: strategyUSDT,
    WETH: strategyWETH,
    STONE: strategySTONE,
  },
  // TODO mode
  ReserveAssets: {
    [eModeNetwork.mode]: {
      USDC: '0xd988097fb8612cc24eeC14542bC03424c656005f',
      USDT: '0xf0F161fDA2712DB8b566946122a5af183995e2eD',
      WETH: '0x4200000000000000000000000000000000000006',
      STONE: '0x80137510979822322193FC997d400D5A6C747bf7',
    },
  },
};

export default ModeConfig;
