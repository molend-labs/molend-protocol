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
      DAI: '0xe3520349f477a5f6eb06107066048508498a291b',
      USDC: '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
      USDT: '0x4988a896b1227218e4a686fde5eabdcabd91571f',
      WBTC: '0xf4eb217ba2454613b15dbdea6e5f22276410e89e',
      WETH: '0xB8AD40DCfc163694F981D2e12704C0a7af9387DF',
    },
  },
};

export default ModeConfig;
