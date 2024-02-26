import { task } from "hardhat/config";
import { getLendingPoolAddressesProvider, getUiPoolDataProvider } from "../../helpers/contracts-getters";

task("dev:userinfo", "Show user info")
  .addParam("user")
  .setAction(async ({ user }, localBRE) => {
    await localBRE.run("set-DRE");

    const addressesProvider = await getLendingPoolAddressesProvider();
    const uiPoolDataProvider = await getUiPoolDataProvider();

    const info = await uiPoolDataProvider.getUserReservesData(addressesProvider.address, user);
    console.log(info);
  });
