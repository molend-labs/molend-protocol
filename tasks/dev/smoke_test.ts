import { task } from "hardhat/config";
import { getLendingPool, getMintableERC20, getSigner } from "../../helpers/contracts-getters";
import { waitForTx } from "../../helpers/misc-utils";

const GWEI = 1000 * 1000 * 1000;
const gasPrice = 1 * GWEI;

task("dev:smoke", "Smoke test (deposit, borrow, repay)")
  .addParam("token")
  .addParam("deposit")
  .addParam("borrow")
  .setAction(async ({ token, deposit, borrow }, localBRE) => {
    await localBRE.run("set-DRE");

    const user = await getSigner(0);
    const userAddress = await user.getAddress();
    const erc20 = await getMintableERC20(token);
    const lendingPool = await getLendingPool();

    console.log(`User ${userAddress}, pool ${lendingPool.address}`);

    // deposit
    await waitForTx(
      await erc20.connect(user).approve(lendingPool.address, deposit)
    );
    await waitForTx(
      await lendingPool.connect(user).deposit(token, deposit, userAddress, 0, {
        gasLimit: 1000000,
        gasPrice,
      })
    );
    console.log(`User deposited ${deposit} token ${token}`);

    // borrow
    await waitForTx(
      await lendingPool.connect(user).borrow(
        token,
        borrow,
        2, // interest mode
        0, // referral
        userAddress,
        {
          gasLimit: 1000000,
          gasPrice,
        }
      )
    );
    console.log("User borrowed");
  });
