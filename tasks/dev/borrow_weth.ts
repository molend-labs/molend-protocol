import { ethers } from 'ethers';
import { task } from 'hardhat/config';
import {
  getAllMockedTokens,
  getLendingPool,
  getSigner,
  getWETHMocked,
} from '../../helpers/contracts-getters';
import { getDb, waitForTx } from '../../helpers/misc-utils';
import { LendingPool, UiPoolDataProvider, WETH9MockedFactory } from '../../types';

const GWEI = 1000 * 1000 * 1000;
const gasPrice = 0 * GWEI;

const amount = (a: string) => {
  return ethers.utils.parseUnits(a);
};

task('dev:ethborrow', 'Borrow with WETH').setAction(async ({}, localBRE) => {
  await localBRE.run('set-DRE');

  const token1 = await getWETHMocked();

  const mockTokens = await getAllMockedTokens();
  const token2 = mockTokens['DAI'];
  console.log('token1 address', token1.address);
  console.log('token2 address', token2.address);

  const lendingPool = await getLendingPool();

  const user1 = await getSigner(0);
  const user2 = await getSigner(1);
  const user1Addr = await user1.getAddress();
  const user2Addr = await user2.getAddress();
  console.log('user1', user1Addr);
  console.log('user2', user2Addr);

  const user1DepositAmount = amount('0.001'); // 1 ETH = 500 DAI
  const user2DepositAmount = amount('10'); // 10 DAI = 0.02 ETH
  const user2BorrowAmount = amount('0.0001');

  // user 1 deposit ETH for WETH
  await waitForTx(
    await token1.deposit({
      value: ethers.utils.parseUnits('0.001'),
    })
  );
  console.log('user1 deposited ETH to WETH');

  // user 1 approve
  console.log('pool address', lendingPool.address);
  await waitForTx(await token1.connect(user1).approve(lendingPool.address, user1DepositAmount));

  console.log('user1 approved token1');

  const user1Token1Balance = await token1.balanceOf(user1Addr);
  console.log('user1 token1 bal', user1Token1Balance.toString());
  const user1Allowance = await token1.allowance(user1Addr, lendingPool.address);
  console.log('user1 pool allowance', user1Allowance.toString());

  // user 1 deposit
  await waitForTx(
    await lendingPool.connect(user1).deposit(token1.address, user1DepositAmount, user1Addr, 0, {
      gasLimit: 1000000,
      gasPrice,
    })
  );
  console.log('user1 deposited DAI');

  // user 2 approve
  await waitForTx(await token2.connect(user2).approve(lendingPool.address, user2DepositAmount));
  console.log('user2 approved');

  // user 2 deposit
  await waitForTx(
    await lendingPool.connect(user2).deposit(token2.address, user2DepositAmount, user2Addr, 0, {
      gasLimit: 1000000,
      gasPrice,
    })
  );
  console.log('user2 deposited');

  // user 2 borrow
  await waitForTx(
    await lendingPool.connect(user2).borrow(
      token1.address,
      user2BorrowAmount,
      2, // interest mode
      0, // referral
      user2Addr,
      {
        gasLimit: 1000000,
        gasPrice,
      }
    )
  );
  console.log('user2 borrowed');

  // user 2 approve to repay
  await waitForTx(await token1.connect(user2).approve(lendingPool.address, user2BorrowAmount));
  console.log('user2 approved for repay');

  // user 2 repay
  await waitForTx(
    await lendingPool
      .connect(user2)
      .repay(token1.address, user2BorrowAmount, 2, await user2.getAddress())
  );
  console.log('user2 repaid');
});

async function getUserData(pool: LendingPool, userAddr: string) {
  return pool.getUserAccountData(userAddr);
}
