import { task } from "hardhat/config";
import { ICommonConfiguration, IReserveParams, eNetwork } from "../../helpers/types";
import { ConfigNames, loadPoolConfig } from "../../helpers/configuration";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import { getFirstSigner, getLendingPoolAddressesProvider, getLendingPoolConfiguratorProxy } from "../../helpers/contracts-getters";
import { deployRateStrategy } from "../../helpers/contracts-deployments";
import { waitForTx } from "../../helpers/misc-utils";

task("dev:update-asset", "Update asset configrations")
  .addParam("asset", "Asset name (like WBTC)")
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .setAction(async ({ asset , pool }, localBRE) => {
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
    const assetAddress = reserveAssets[asset as string];
    if (!assetAddress) {
      throw new Error("no such asset");
    }

    const assetConfig: IReserveParams = ReservesConfig[asset as string];
    const { strategy } = assetConfig;
    const addressProvider = await getLendingPoolAddressesProvider();

    const rateStrategies = [
      addressProvider.address,
      strategy.optimalUtilizationRate,
      strategy.baseVariableBorrowRate,
      strategy.variableRateSlope1,
      strategy.variableRateSlope2,
      strategy.stableRateSlope1,
      strategy.stableRateSlope2,
    ];
    const strategyAddress = await deployRateStrategy(
      strategy.name,
      rateStrategies as any,
      false,
    );

    const configrator = await getLendingPoolConfiguratorProxy();
    const signer = await getFirstSigner();
    configrator.connect(signer);
    await waitForTx(
      await configrator.setReserveInterestRateStrategyAddress(assetAddress, strategyAddress)
    );
    console.log("Asset rate strategy set to", strategyAddress);

    // set reserve configrations
    await waitForTx(
      await configrator.configureReserveAsCollateral(
        assetAddress, 
        assetConfig.baseLTVAsCollateral, 
        assetConfig.liquidationThreshold,
        assetConfig.liquidationBonus,
      )
    );
    console.log("Collateral configs updated");

    // set reserve factor
    await waitForTx(
      await configrator.setReserveFactor(assetAddress, assetConfig.reserveFactor)
    );
    console.log("Reserve factor updated");
  });
