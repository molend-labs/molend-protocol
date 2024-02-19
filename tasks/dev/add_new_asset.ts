import { task } from "hardhat/config";
import { ICommonConfiguration, eNetwork } from "../../helpers/types";
import { ConfigNames, getTreasuryAddress, loadPoolConfig } from "../../helpers/configuration";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import { configureReservesByHelper, initReservesByHelper } from "../../helpers/init-helpers";
import { getAaveProtocolDataProvider, getLendingPoolAddressesProvider } from "../../helpers/contracts-getters";

task("dev:new-asset", "Add new asset to protocol")
  .addParam('asset', 'Asset symbol name')
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ asset, pool, verify }, localBRE) => {
    await localBRE.run("set-DRE");
    const network = <eNetwork>localBRE.network.name;
    const poolConfig = loadPoolConfig(pool);
    const {
      ATokenNamePrefix,
      StableDebtTokenNamePrefix,
      VariableDebtTokenNamePrefix,
      SymbolPrefix,
      ReserveAssets,
      ReservesConfig,
      LendingPoolCollateralManager,
      WethGateway,
      IncentivesController,
    } = poolConfig as ICommonConfiguration;

    const reserveAssets = await getParamPerNetwork(ReserveAssets, network);
    const assetAddress = reserveAssets[asset];
    if (!assetAddress) {
      throw new Error("Bad asset, make sure it's configured and please enter the asset symbol name");
    }

    const addressesProvider = await getLendingPoolAddressesProvider();
    const admin = await addressesProvider.getPoolAdmin();
    const treasuryAddress = await getTreasuryAddress(poolConfig);
    const incentivesController = await getParamPerNetwork(IncentivesController, network);

    await initReservesByHelper(
      ReservesConfig,
      { [asset]: assetAddress },
      ATokenNamePrefix,
      StableDebtTokenNamePrefix,
      VariableDebtTokenNamePrefix,
      SymbolPrefix,
      admin,
      treasuryAddress,
      incentivesController,
      pool,
      verify
    );
    console.log(`Reserves ${asset} initialized`);

    const testHelpers = await getAaveProtocolDataProvider();
    await configureReservesByHelper(ReservesConfig, reserveAssets, testHelpers, admin);
    console.log(`Reserves ${asset} configured`);
  });
