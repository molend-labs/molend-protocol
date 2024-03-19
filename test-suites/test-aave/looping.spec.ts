import { makeSuite, TestEnv } from './helpers/make-suite';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { ProtocolErrors } from '../../helpers/types';
import { PERCENTAGE_FACTOR } from '../../helpers/constants';
import { UnwrapPromise } from '../../helpers/types';

makeSuite('Looping', (env: TestEnv) => {
  it.only('Add Liquidity', async () => {
    const { users, helpersContract, pool, dai, aDai, weth, aWETH, usdc, aUSDC } = env;
    const liquidityProvider = users[0];

    // Liquidity provider assets
    expect(await dai.balanceOf(liquidityProvider.address)).eq(BigNumber.from(0));
    expect(await weth.balanceOf(liquidityProvider.address)).eq(BigNumber.from(0));
    expect(await usdc.balanceOf(liquidityProvider.address)).eq(BigNumber.from(0));

    const daiAmount = parseUnits('10000', 18); // 10000 DAI
    const wethAmount = parseUnits('20000', 18); // 20000 WETH
    const usdcAmount = parseUnits('30000', 6); // 30000 USDC

    // Assets are actually held by AToken
    expect(await dai.balanceOf(aDai.address)).eq(BigNumber.from(0));
    expect(await weth.balanceOf(aWETH.address)).eq(BigNumber.from(0));
    expect(await usdc.balanceOf(aUSDC.address)).eq(BigNumber.from(0));
    expect((await helpersContract.getReserveData(dai.address)).availableLiquidity).eq(
      BigNumber.from(0)
    );
    expect((await helpersContract.getReserveData(weth.address)).availableLiquidity).eq(
      BigNumber.from(0)
    );
    expect((await helpersContract.getReserveData(usdc.address)).availableLiquidity).eq(
      BigNumber.from(0)
    );

    // Mint assets for liquidity provider
    await dai.connect(liquidityProvider.signer).mint(daiAmount);
    await dai.connect(liquidityProvider.signer).approve(pool.address, daiAmount);
    await weth.connect(liquidityProvider.signer).mint(wethAmount);
    await weth.connect(liquidityProvider.signer).approve(pool.address, wethAmount);
    await usdc.connect(liquidityProvider.signer).mint(usdcAmount);
    await usdc.connect(liquidityProvider.signer).approve(pool.address, usdcAmount);

    // Liquidity provider assets
    expect(await dai.balanceOf(liquidityProvider.address)).eq(daiAmount);
    expect(await weth.balanceOf(liquidityProvider.address)).eq(wethAmount);
    expect(await usdc.balanceOf(liquidityProvider.address)).eq(usdcAmount);

    // Deposit assets
    await pool
      .connect(liquidityProvider.signer)
      .deposit(dai.address, daiAmount, liquidityProvider.address, 0);
    await pool
      .connect(liquidityProvider.signer)
      .deposit(weth.address, wethAmount, liquidityProvider.address, 0);
    await pool
      .connect(liquidityProvider.signer)
      .deposit(usdc.address, usdcAmount, liquidityProvider.address, 0);

    // Check liquidity
    expect(await dai.balanceOf(aDai.address)).eq(daiAmount);
    expect(await weth.balanceOf(aWETH.address)).eq(wethAmount);
    expect(await usdc.balanceOf(aUSDC.address)).eq(usdcAmount);
    expect((await helpersContract.getReserveData(dai.address)).availableLiquidity).eq(
      BigNumber.from(daiAmount)
    );
    expect((await helpersContract.getReserveData(weth.address)).availableLiquidity).eq(
      BigNumber.from(wethAmount)
    );
    expect((await helpersContract.getReserveData(usdc.address)).availableLiquidity).eq(
      BigNumber.from(usdcAmount)
    );
  });

  it.only('(User 1) Looping DAI with 3x leverage', async () => {
    const { users, helpersContract, looping, dai, vDai } = env;
    const user = users[1];

    // User DAI amount
    expect(await dai.balanceOf(user.address)).eq(BigNumber.from(0));

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(dai.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const daiAmount = parseUnits('600', 18); // 600 DAI
    const principalDaiAmount = parseUnits('500', 18); // 500 DAI
    const borrowedDaiAmount = principalDaiAmount.mul(2); // 1000 DAI
    const flashloanFeeDaiAmount = borrowedDaiAmount.mul(9).div(PERCENTAGE_FACTOR);

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
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(principalDaiAmount.add(borrowedDaiAmount).toString()),
      Number(parseUnits('0.2', 18).toString())
    );
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(borrowedDaiAmount));
  });

  it.only('(User 2) Looping DAI with max leverage', async () => {
    const { pool, users, helpersContract, looping, dai, vDai } = env;
    const user = users[2];

    // User DAI amount
    expect(await dai.balanceOf(user.address)).eq(BigNumber.from(0));

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(dai.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const { ltv } = await helpersContract.getReserveConfigurationData(dai.address);
    const leverage = BigNumber.from(PERCENTAGE_FACTOR).div(
      BigNumber.from(PERCENTAGE_FACTOR).sub(ltv)
    ); // 4x

    const daiAmount = parseUnits('600', 18); // 600 DAI
    const principalDaiAmount = parseUnits('500', 18); // 500 DAI
    const borrowedDaiAmount = principalDaiAmount.mul(leverage.sub(1)); // 1500 DAI
    const flashloanFeeDaiAmount = borrowedDaiAmount.mul(9).div(PERCENTAGE_FACTOR);

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
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(principalDaiAmount.add(borrowedDaiAmount).toString()),
      Number(parseUnits('0.2', 18).toString())
    );
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(borrowedDaiAmount));

    const userAccountData = await pool.getUserAccountData(user.address);
    console.log('HealthFactor (DAI):', userAccountData.healthFactor);
  });

  it.only('(User 2) Looping USDC with max leverage with initial debt (DAI)', async () => {
    const { pool, users, helpersContract, looping, usdc, vUSDC } = env;
    const user = users[2]; // user 2 has loop the DAI with max leverage

    // User USDC amount
    expect(await usdc.balanceOf(user.address)).eq(BigNumber.from(0));

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(usdc.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const { ltv } = await helpersContract.getReserveConfigurationData(usdc.address);
    const leverage = BigNumber.from(PERCENTAGE_FACTOR).div(
      BigNumber.from(PERCENTAGE_FACTOR).sub(ltv)
    ); // 5x

    const usdcAmount = parseUnits('600', 6); // 600 USDC
    const principalUsdcAmount = parseUnits('500', 6); // 500 USDC
    const borrowedUsdcAmount = principalUsdcAmount.mul(leverage.sub(1)); // 2000 USDC
    const flashloanFeeUsdcAmount = borrowedUsdcAmount.mul(9).div(PERCENTAGE_FACTOR);

    // Mint USDC for user
    await usdc.connect(user.signer).mint(usdcAmount);
    await usdc
      .connect(user.signer)
      .approve(looping.address, principalUsdcAmount.add(flashloanFeeUsdcAmount));

    // User USDC balance
    expect(await usdc.balanceOf(user.address)).eq(usdcAmount);

    // Approval for looping contract to borrow for user
    await vUSDC.connect(user.signer).approveDelegation(looping.address, borrowedUsdcAmount);

    // Loop
    await looping.connect(user.signer).loop(usdc.address, principalUsdcAmount, borrowedUsdcAmount);

    // User remaining USDC balance after looping
    expect(await usdc.balanceOf(user.address)).eq(
      usdcAmount.sub(principalUsdcAmount).sub(flashloanFeeUsdcAmount)
    );

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(usdc.address, user.address);
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(principalUsdcAmount.add(borrowedUsdcAmount).toString()),
      Number(parseUnits('0.2', 6).toString())
    );
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(borrowedUsdcAmount));

    const userAccountData = await pool.getUserAccountData(user.address);
    console.log('HealthFactor (DAI + USDC):', userAccountData.healthFactor);
  });

  it.only('(User 3) Looping DAI exceed max leverage', async () => {
    const { users, helpersContract, looping, dai, vDai } = env;
    const user = users[3];

    // User DAI amount
    expect(await dai.balanceOf(user.address)).eq(BigNumber.from(0));

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(dai.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const { ltv } = await helpersContract.getReserveConfigurationData(dai.address);
    const leverage = BigNumber.from(PERCENTAGE_FACTOR).div(
      BigNumber.from(PERCENTAGE_FACTOR).sub(ltv)
    ); // 4x

    const daiAmount = parseUnits('600', 18); // 600 DAI
    const principalDaiAmount = parseUnits('500', 18); // 500 DAI
    const borrowedDaiAmount = principalDaiAmount.mul(leverage.sub(1)).add(parseUnits('1', 18)); // 1501 DAI
    const flashloanFeeDaiAmount = borrowedDaiAmount.mul(9).div(PERCENTAGE_FACTOR);

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
    expect(
      looping.connect(user.signer).loop(dai.address, principalDaiAmount, borrowedDaiAmount)
    ).revertedWith(ProtocolErrors.VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);
  });

  it.only('(User 4) Looping ETH with 3x leverage', async () => {
    const { users, helpersContract, looping, weth, vWETH } = env;
    const user = users[4];

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(weth.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const principalWethAmount = parseUnits('500', 18); // 500 WETH
    const borrowedWethAmount = principalWethAmount.mul(2); // 1000 WETH
    const flashloanFeeWethAmount = borrowedWethAmount.mul(9).div(PERCENTAGE_FACTOR);

    // Approval for looping contract to borrow for user
    await vWETH.connect(user.signer).approveDelegation(looping.address, borrowedWethAmount);

    // Loop
    await looping.connect(user.signer).loop(weth.address, principalWethAmount, borrowedWethAmount, {
      value: principalWethAmount.add(flashloanFeeWethAmount),
    });

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(weth.address, user.address);
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(principalWethAmount.add(borrowedWethAmount).toString()),
      Number(parseUnits('0.2', 18).toString())
    );
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(borrowedWethAmount));
  });

  it.only('(User 5) Looping ETH with max leverage', async () => {
    const { pool, users, helpersContract, looping, weth, vWETH } = env;
    const user = users[5];

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(weth.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const { ltv } = await helpersContract.getReserveConfigurationData(weth.address);
    const leverage = BigNumber.from(PERCENTAGE_FACTOR).div(
      BigNumber.from(PERCENTAGE_FACTOR).sub(ltv)
    ); // 5x

    const principalWethAmount = parseUnits('500', 18); // 500 WETH
    const borrowedWethAmount = principalWethAmount.mul(leverage.sub(1)); // 2000 ETH
    const flashloanFeeWethAmount = borrowedWethAmount.mul(9).div(PERCENTAGE_FACTOR);

    // Approval for looping contract to borrow for user
    await vWETH.connect(user.signer).approveDelegation(looping.address, borrowedWethAmount);

    // Loop
    await looping.connect(user.signer).loop(weth.address, principalWethAmount, borrowedWethAmount, {
      value: principalWethAmount.add(flashloanFeeWethAmount),
    });

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(weth.address, user.address);
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(principalWethAmount.add(borrowedWethAmount).toString()),
      Number(parseUnits('0.2', 18).toString())
    );
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(borrowedWethAmount));

    const userAccountData = await pool.getUserAccountData(user.address);
    console.log('HealthFactor (ETH):', userAccountData.healthFactor);
  });

  it.only('(User 5) Looping USDC with max leverage with initial debt (ETH)', async () => {
    const { pool, users, helpersContract, looping, usdc, vUSDC } = env;
    const user = users[5]; // user 5 has loop the ETH with max leverage

    // User USDC amount
    expect(await usdc.balanceOf(user.address)).eq(BigNumber.from(0));

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(usdc.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const { ltv } = await helpersContract.getReserveConfigurationData(usdc.address);
    const leverage = BigNumber.from(PERCENTAGE_FACTOR).div(
      BigNumber.from(PERCENTAGE_FACTOR).sub(ltv)
    ); // 5x

    const usdcAmount = parseUnits('600', 6); // 600 USDC
    const principalUsdcAmount = parseUnits('500', 6); // 500 USDC
    const borrowedUsdcAmount = principalUsdcAmount.mul(leverage.sub(1)); // 2000 USDC
    const flashloanFeeUsdcAmount = borrowedUsdcAmount.mul(9).div(PERCENTAGE_FACTOR);

    // Mint USDC for user
    await usdc.connect(user.signer).mint(usdcAmount);
    await usdc
      .connect(user.signer)
      .approve(looping.address, principalUsdcAmount.add(flashloanFeeUsdcAmount));

    // User USDC balance
    expect(await usdc.balanceOf(user.address)).eq(usdcAmount);

    // Approval for looping contract to borrow for user
    await vUSDC.connect(user.signer).approveDelegation(looping.address, borrowedUsdcAmount);

    // Loop
    await looping.connect(user.signer).loop(usdc.address, principalUsdcAmount, borrowedUsdcAmount);

    // User remaining USDC balance after looping
    expect(await usdc.balanceOf(user.address)).eq(
      usdcAmount.sub(principalUsdcAmount).sub(flashloanFeeUsdcAmount)
    );

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(usdc.address, user.address);
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(principalUsdcAmount.add(borrowedUsdcAmount).toString()),
      Number(parseUnits('0.2', 6).toString())
    );
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(borrowedUsdcAmount));

    const userAccountData = await pool.getUserAccountData(user.address);
    console.log('HealthFactor (ETH + USDC):', userAccountData.healthFactor);
  });

  it.only('(User 5) Looping DAI with max leverage with initial debt (ETH + USDC)', async () => {
    const { pool, users, helpersContract, looping, dai, vDai } = env;
    const user = users[5];

    // User DAI amount
    expect(await dai.balanceOf(user.address)).eq(BigNumber.from(0));

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(dai.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const { ltv } = await helpersContract.getReserveConfigurationData(dai.address);
    const leverage = BigNumber.from(PERCENTAGE_FACTOR).div(
      BigNumber.from(PERCENTAGE_FACTOR).sub(ltv)
    ); // 4x

    const daiAmount = parseUnits('600', 18); // 600 DAI
    const principalDaiAmount = parseUnits('500', 18); // 500 DAI
    const borrowedDaiAmount = principalDaiAmount.mul(leverage.sub(1)); // 1500 DAI
    const flashloanFeeDaiAmount = borrowedDaiAmount.mul(9).div(PERCENTAGE_FACTOR);

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
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(principalDaiAmount.add(borrowedDaiAmount).toString()),
      Number(parseUnits('0.2', 18).toString())
    );
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(borrowedDaiAmount));

    const userAccountData = await pool.getUserAccountData(user.address);
    console.log('HealthFactor (ETH + USDC + DAI):', userAccountData.healthFactor);
  });

  it.only('(User 6) Looping ETH exceed max leverage', async () => {
    const { users, helpersContract, looping, weth, vWETH } = env;
    const user = users[6];

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(weth.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const { ltv } = await helpersContract.getReserveConfigurationData(weth.address);
    const leverage = BigNumber.from(PERCENTAGE_FACTOR).div(
      BigNumber.from(PERCENTAGE_FACTOR).sub(ltv)
    ); // 5x

    const principalWethAmount = parseUnits('500', 18); // 500 WETH
    const borrowedWethAmount = principalWethAmount.mul(leverage.sub(1)).add(parseUnits('1', 18)); // 2001 ETH
    const flashloanFeeWethAmount = borrowedWethAmount.mul(9).div(PERCENTAGE_FACTOR);

    // Approval for looping contract to borrow for user
    await vWETH.connect(user.signer).approveDelegation(looping.address, borrowedWethAmount);

    // Loop
    await expect(
      looping.connect(user.signer).loop(weth.address, principalWethAmount, borrowedWethAmount, {
        value: principalWethAmount.add(flashloanFeeWethAmount),
      })
    ).revertedWith(ProtocolErrors.VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);
  });

  it.only('(User 6) Looping ETH with max leverage and then looping USDC with (approaching) max leverage', async () => {
    const { pool, users, helpersContract, looping, weth, vWETH, usdc, vUSDC } = env;
    const user = users[6];

    let userReserveData: UnwrapPromise<ReturnType<typeof helpersContract.getUserReserveData>>;
    let userAccountData: UnwrapPromise<ReturnType<typeof pool.getUserAccountData>>;
    let ltv: BigNumber;
    let leverage: BigNumber;

    // -------------------------- loop USDC -------------------------------

    // User USDC amount
    expect(await usdc.balanceOf(user.address)).eq(BigNumber.from(0));

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(usdc.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    ({ ltv } = await helpersContract.getReserveConfigurationData(usdc.address));
    leverage = BigNumber.from(PERCENTAGE_FACTOR).div(BigNumber.from(PERCENTAGE_FACTOR).sub(ltv)); // 5x

    const usdcAmount = parseUnits('600', 6); // 600 USDC
    const principalUsdcAmount = parseUnits('500', 6); // 500 USDC
    const borrowedUsdcAmount = principalUsdcAmount.mul(leverage.sub(1)); // 2000 USDC
    const flashloanFeeUsdcAmount = borrowedUsdcAmount.mul(9).div(PERCENTAGE_FACTOR);

    // Mint USDC for user
    await usdc.connect(user.signer).mint(usdcAmount);
    await usdc
      .connect(user.signer)
      .approve(looping.address, principalUsdcAmount.add(flashloanFeeUsdcAmount));

    // User USDC balance
    expect(await usdc.balanceOf(user.address)).eq(usdcAmount);

    // Approval for looping contract to borrow for user
    await vUSDC.connect(user.signer).approveDelegation(looping.address, borrowedUsdcAmount);

    // Loop
    await looping.connect(user.signer).loop(usdc.address, principalUsdcAmount, borrowedUsdcAmount);

    // User remaining USDC balance after looping
    expect(await usdc.balanceOf(user.address)).eq(
      usdcAmount.sub(principalUsdcAmount).sub(flashloanFeeUsdcAmount)
    );

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(usdc.address, user.address);
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(principalUsdcAmount.add(borrowedUsdcAmount).toString()),
      Number(parseUnits('0.2', 6).toString())
    );
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(borrowedUsdcAmount));

    userAccountData = await pool.getUserAccountData(user.address);
    console.log('HealthFactor (USDC):', userAccountData.healthFactor);

    // -------------------------- loop ETH -------------------------------

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(weth.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    ({ ltv } = await helpersContract.getReserveConfigurationData(weth.address));
    leverage = BigNumber.from(PERCENTAGE_FACTOR).div(BigNumber.from(PERCENTAGE_FACTOR).sub(ltv)); // 5x

    const principalWethAmount = parseUnits('500', 18); // 500 WETH
    const borrowedWethAmount = principalWethAmount.mul(leverage.sub(1)); // 2000 ETH
    const flashloanFeeWethAmount = borrowedWethAmount.mul(9).div(PERCENTAGE_FACTOR);

    // Approval for looping contract to borrow for user
    await vWETH.connect(user.signer).approveDelegation(looping.address, borrowedWethAmount);

    // Loop
    await looping.connect(user.signer).loop(weth.address, principalWethAmount, borrowedWethAmount, {
      value: principalWethAmount.add(flashloanFeeWethAmount),
    });

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(weth.address, user.address);
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(principalWethAmount.add(borrowedWethAmount).toString()),
      Number(parseUnits('0.2', 18).toString())
    );
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(borrowedWethAmount));

    userAccountData = await pool.getUserAccountData(user.address);
    console.log('HealthFactor (USDC + ETH):', userAccountData.healthFactor);
  });
});
