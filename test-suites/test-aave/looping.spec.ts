import { makeSuite, TestEnv } from './helpers/make-suite';
import { expect } from 'chai';
import { before } from 'mocha';
import { BigNumber, ethers } from 'ethers';
import { parseAmount } from './helpers/utils/math';

makeSuite('Looping', (env: TestEnv) => {
  it.only('Add Liquidity', async () => {
    const { users, helpersContract, pool, dai, aDai } = env;
    const liquidityProvider = users[0];

    const daiAmount = parseAmount(10000, 18); // 10000 DAI

    expect(await dai.balanceOf(aDai.address)).eq(BigNumber.from(0));
    expect((await helpersContract.getReserveData(dai.address)).availableLiquidity).eq(
      BigNumber.from(0)
    );

    await dai.connect(liquidityProvider.signer).mint(daiAmount);
    await dai.connect(liquidityProvider.signer).approve(pool.address, daiAmount);
    await pool
      .connect(liquidityProvider.signer)
      .deposit(dai.address, daiAmount, liquidityProvider.address, 0);

    expect(await dai.balanceOf(aDai.address)).eq(daiAmount);
    expect((await helpersContract.getReserveData(dai.address)).availableLiquidity).eq(
      BigNumber.from(daiAmount)
    );
  });

  it.only('Looping DAI with 3x leverage', async () => {
    const { users, helpersContract, looping, dai, vDai, aDai } = env;
    const user = users[1];

    expect(await dai.balanceOf(user.address)).eq(BigNumber.from(0));

    let userReserveData = await helpersContract.getUserReserveData(dai.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const daiAmount = parseAmount(600, 18); // 600 DAI
    const principalAmount = parseAmount(500, 18); // 500 DAI
    const borrowedAmount = parseAmount(1000, 18); // 1000 DAI

    await dai.connect(user.signer).mint(daiAmount);
    await dai.connect(user.signer).approve(looping.address, daiAmount);
    await vDai.connect(user.signer).approveDelegation(looping.address, borrowedAmount);

    await looping.connect(user.signer).loop(dai.address, principalAmount, borrowedAmount);

    userReserveData = await helpersContract.getUserReserveData(dai.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from('1500117391304347826087')); // TODO why extra '117391304347826087'
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(borrowedAmount));

    console.log(`User DAI balance:`, await dai.balanceOf(user.address));
    console.log(`aDAI DAI balance:`, await dai.balanceOf(aDai.address));
    console.log(`ReverseData:`, await helpersContract.getReserveData(dai.address));
    console.log(
      `UserReverseData:`,
      await helpersContract.getUserReserveData(dai.address, user.address)
    );
  });
});
