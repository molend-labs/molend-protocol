import BigNumber from 'bignumber.js';
import {
  oneEther,
  oneRay,
  RAY,
  ZERO_ADDRESS,
  MOCK_CHAINLINK_AGGREGATORS_PRICES,
} from '../../helpers/constants';
import { ICommonConfiguration, eModeNetwork } from '../../helpers/types';

// ----------------
// PROTOCOL GLOBAL PARAMS
// ----------------

export const CommonsConfig: ICommonConfiguration = {
  MarketId: 'Commons',
  ATokenNamePrefix: 'Molend Mode Market',
  StableDebtTokenNamePrefix: 'Molend Mode Market stable debt',
  VariableDebtTokenNamePrefix: 'Molend Mode Market variable debt',
  SymbolPrefix: 'm',
  ProviderId: 0, // Overriden in index.ts
  OracleQuoteCurrency: 'USD',
  OracleQuoteUnit: oneEther.toString(),
  ProtocolGlobalParams: {
    TokenDistributorPercentageBase: '10000',
    MockUsdPriceInWei: '5848466240000000',
    UsdAddress: '0x10F7Fc1F91Ba351f9C629c5947AD69bD03C05b96',
    NilAddress: '0x0000000000000000000000000000000000000000',
    OneAddress: '0x0000000000000000000000000000000000000001',
    AaveReferral: '0',
  },

  // ----------------
  // COMMON PROTOCOL PARAMS ACROSS POOLS AND NETWORKS
  // ----------------

  Mocks: {
    AllAssetsInitialPrices: {
      ...MOCK_CHAINLINK_AGGREGATORS_PRICES,
    },
  },
  // TODO: reorg alphabetically, checking the reason of tests failing
  LendingRateOracleRatesCommon: {
    WETH: {
      borrowRate: oneRay.multipliedBy(0.03).toFixed(),
    },
    DAI: {
      borrowRate: oneRay.multipliedBy(0.039).toFixed(),
    },
    USDC: {
      borrowRate: oneRay.multipliedBy(0.039).toFixed(),
    },
    USDT: {
      borrowRate: oneRay.multipliedBy(0.035).toFixed(),
    },
    WBTC: {
      borrowRate: oneRay.multipliedBy(0.03).toFixed(),
    },
  },
  // ----------------
  // COMMON PROTOCOL ADDRESSES ACROSS POOLS
  // ----------------

  // If PoolAdmin/emergencyAdmin is set, will take priority over PoolAdminIndex/emergencyAdminIndex
  PoolAdmin: {
    [eModeNetwork.mode]: undefined,
  },
  PoolAdminIndex: 0,
  EmergencyAdminIndex: 0,
  EmergencyAdmin: {
    [eModeNetwork.mode]: undefined,
  },
  LendingPool: {
    [eModeNetwork.mode]: '',
  },
  LendingPoolConfigurator: {
    [eModeNetwork.mode]: '',
  },
  // TODO mode
  ProviderRegistry: {
    // [ePolygonNetwork.mumbai]: '0xE6ef11C967898F9525D550014FDEdCFAB63536B5',
    [eModeNetwork.mode]: ''
  },
  // TODO mode
  ProviderRegistryOwner: {
    // [ePolygonNetwork.mumbai]: '0x943E44157dC0302a5CEb172374d1749018a00994',
    // [ePolygonNetwork.matic]: '0xD7D86236d6c463521920fCC50A9CB56f8C8Bf008',
    [eModeNetwork.mode]: ''
  },
  // TODO mode
  LendingRateOracle: {
    // [ePolygonNetwork.mumbai]: '0xC661e1445F9a8E5FD3C3dbCa0A0A2e8CBc79725D',
    // [ePolygonNetwork.matic]: '0x17F73aEaD876CC4059089ff815EDA37052960dFB',
    [eModeNetwork.mode]: ''
  },
  // TODO mode
  LendingPoolCollateralManager: {
    // [ePolygonNetwork.mumbai]: '0x2A7004B21c49253ca8DF923406Fed9a02AA86Ba0',
    // [ePolyAaveCollector deployed: 0xd83C5e9a0D6D521a9E23D25Df1862A23134e1803gonNetwork.matic]: '0xA39599424642D9fD35e475EF802EddF798dc555B',
    [eModeNetwork.mode]: ''
  },
  TokenDistributor: {
    [eModeNetwork.mode]: ''
  },
  WethGateway: {
    [eModeNetwork.mode]: ''
  },
  AaveOracle: {
    [eModeNetwork.mode]: ''
  },
  FallbackOracle: {
    [eModeNetwork.mode]: ZERO_ADDRESS,
  },
  // TODO mode
  ChainlinkAggregator: {
    [eModeNetwork.mode]: {
      USDT: '0x86592C8141Aec8f7B836f4559614233b253c55F1',
      USDC: '0xfb6D1C2e9cbFCf6190F30D1766935f3B0057305b',
      USD: '0x86592C8141Aec8f7B836f4559614233b253c55F1',
      WETH: '0x5290b68e09b4f79F63ed01710003E7949FB32B77',
    },
  },
  ReserveAssets: {
    [eModeNetwork.mode]: {},
  },
  ReservesConfig: {},
  ATokenDomainSeparator: {
    [eModeNetwork.mode]: '',
  },
  // TODO mode
  WETH: {
    [eModeNetwork.mode]: '0x4200000000000000000000000000000000000006',
  },
  // TODO mode
  WrappedNativeToken: {
    [eModeNetwork.mode]: '0x4200000000000000000000000000000000000006',
  },
  // TODO mode
  ReserveFactorTreasuryAddress: {
    [eModeNetwork.mode]: '0xCaFDdA4DB4a42C0Fd77C58fdaA28860849124fa2',
  },
  // TODO mode
  IncentivesController: {
    [eModeNetwork.mode]: '0x0000000000000000000000000000000000000000',
  },
};
