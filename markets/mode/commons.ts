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
      USDT: '0xa204F4A3d167dF2621EF092915dC4D0777f8A83C',
      USDC: '0xa204F4A3d167dF2621EF092915dC4D0777f8A83C',
      USD: '0x5608649D5bB1d444e95fcc81D570fbE8495CC179',
      WETH: '0x0201e9937DcCa9dC61315C2f44C2966cC0a33054',
      WSTETH: '0xF0dd0e7208db917121FC3B18315602a3cA120Fe8',
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
    [eModeNetwork.mode]: '0xcc9ffcfBDFE629e9C62776fF01a75235F466794E',
    // [ePolygonNetwork.matic]: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  },
  // TODO mode
  WrappedNativeToken: {
    [eModeNetwork.mode]: '0xcc9ffcfBDFE629e9C62776fF01a75235F466794E',
  },
  // TODO mode
  ReserveFactorTreasuryAddress: {
    [eModeNetwork.mode]: '0x368fd26b1d435bcC2e0E1c1160B63ED7dBCabdd5',
  },
  // TODO mode
  IncentivesController: {
    [eModeNetwork.mode]: '0x0000000000000000000000000000000000000000',
  },
};
