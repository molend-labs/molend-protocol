import { makeSuite, TestEnv } from './helpers/make-suite';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

makeSuite('Looping', (env: TestEnv) => {
  it.only('Add Liquidity', async () => {
    const { users, helpersContract, pool, dai, aDai, weth, aWETH } = env;
    const liquidityProvider = users[0];

    // Liquidity provider assets
    expect(await dai.balanceOf(liquidityProvider.address)).eq(BigNumber.from(0));
    expect(await weth.balanceOf(liquidityProvider.address)).eq(BigNumber.from(0));

    const daiAmount = parseUnits('10000', 18); // 10000 DAI
    const wethAmount = parseUnits('20000', 18); // 20000 WETH

    // Assets are actually held by AToken
    expect(await dai.balanceOf(aDai.address)).eq(BigNumber.from(0));
    expect(await weth.balanceOf(aWETH.address)).eq(BigNumber.from(0));
    expect((await helpersContract.getReserveData(dai.address)).availableLiquidity).eq(
      BigNumber.from(0)
    );
    expect((await helpersContract.getReserveData(weth.address)).availableLiquidity).eq(
      BigNumber.from(0)
    );

    // Mint assets for liquidity provider
    await dai.connect(liquidityProvider.signer).mint(daiAmount);
    await dai.connect(liquidityProvider.signer).approve(pool.address, daiAmount);
    await weth.connect(liquidityProvider.signer).mint(wethAmount);
    await weth.connect(liquidityProvider.signer).approve(pool.address, wethAmount);

    // Liquidity provider assets
    expect(await dai.balanceOf(liquidityProvider.address)).eq(daiAmount);
    expect(await weth.balanceOf(liquidityProvider.address)).eq(wethAmount);

    // Deppsit assets
    await pool
      .connect(liquidityProvider.signer)
      .deposit(dai.address, daiAmount, liquidityProvider.address, 0);
    await pool
      .connect(liquidityProvider.signer)
      .deposit(weth.address, wethAmount, liquidityProvider.address, 0);

    // Check liquidity
    expect(await dai.balanceOf(aDai.address)).eq(daiAmount);
    expect(await weth.balanceOf(aWETH.address)).eq(wethAmount);
    expect((await helpersContract.getReserveData(dai.address)).availableLiquidity).eq(
      BigNumber.from(daiAmount)
    );
    expect((await helpersContract.getReserveData(weth.address)).availableLiquidity).eq(
      BigNumber.from(wethAmount)
    );
  });

  it.only('Looping DAI with 3x leverage', async () => {
    const { users, helpersContract, looping, dai, vDai, aDai } = env;
    const user = users[1];

    // User DAI amount
    expect(await dai.balanceOf(user.address)).eq(BigNumber.from(0));

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(dai.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const daiAmount = parseUnits('600', 18); // 600 DAI
    const principalDaiAmount = parseUnits('500', 18); // 500 DAI
    const borrowedDaiAmount = parseUnits('1000', 18); // 1000 DAI
    const flashloanFeeDaiAmount = borrowedDaiAmount.mul(9).div(10000);

    // Mint DAI for user
    await dai.connect(user.signer).mint(daiAmount);
    await dai
      .connect(user.signer)
      .approve(looping.address, principalDaiAmount.add(flashloanFeeDaiAmount));

    // User DAI balance
    expect(await dai.balanceOf(user.address)).eq(daiAmount);

    // Approval for looping contract to borrow for user
    await vDai.connect(user.signer).approveDelegation(looping.address, borrowedDaiAmount);

    // Loop
    await looping.connect(user.signer).loop(dai.address, principalDaiAmount, borrowedDaiAmount);

    // User remaining DAI balance after looping
    expect(await dai.balanceOf(user.address)).eq(
      daiAmount.sub(principalDaiAmount).sub(flashloanFeeDaiAmount)
    );

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(dai.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from('1500117391304347826087')); // TODO why extra '117391304347826087'
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(borrowedDaiAmount));
  });
});
