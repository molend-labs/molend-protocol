import { makeSuite, TestEnv } from './helpers/make-suite';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { PERCENTAGE_FACTOR } from '../../helpers/constants';
import { deployMintableERC20 } from '../../helpers/contracts-deployments';
import { ProtocolErrors } from '../../helpers/types';

const MAX_LOOP_COUNT = 10;

makeSuite('Looping', (env: TestEnv) => {
  it.only('Loop unsupported token', async () => {
    const { looping, users } = env;
    const user = users[0];
    const token = await deployMintableERC20(['Unsupported', 'Unsupported', '18']);

    const principalTokenAmount = parseUnits('500', 18); // 500 Token
    const leverage = BigNumber.from(PERCENTAGE_FACTOR).mul(3); // 3x
    const { borrowRatio, loopCount } = calcLoopParams({
      leverageRaw: leverage,
      maxLtvRaw: BigNumber.from(8000), // 80%
    });

    // Mint DAI for user
    await token.connect(user.signer).mint(principalTokenAmount);
    await token.connect(user.signer).approve(looping.address, principalTokenAmount);

    // User DAI balance
    expect(await token.balanceOf(user.address)).eq(principalTokenAmount);

    // Loop
    expect(
      looping.connect(user.signer).loop(token.address, principalTokenAmount, borrowRatio, loopCount)
    ).revertedWith(ProtocolErrors.VL_NO_ACTIVE_RESERVE);
  });

  it('(User 1) Looping DAI with 3x leverage', async () => {
    const { users, helpersContract, looping, dai, vDai } = env;
    const user = users[1];

    // User DAI amount
    expect(await dai.balanceOf(user.address)).eq(BigNumber.from(0));

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(dai.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const { ltv } = await helpersContract.getReserveConfigurationData(dai.address);
    const daiAmount = parseUnits('600', 18); // 600 DAI
    const principalDaiAmount = parseUnits('500', 18); // 500 DAI
    const leverage = BigNumber.from(PERCENTAGE_FACTOR).mul(3); // 3x
    const maxDepositedAmount = principalDaiAmount.mul(leverage).div(PERCENTAGE_FACTOR);
    const maxBorrowedAmount = maxDepositedAmount.sub(principalDaiAmount);
    const { borrowRatio, loopCount } = calcLoopParams({
      leverageRaw: leverage,
      maxLtvRaw: ltv,
    });

    // Mint DAI for user
    await dai.connect(user.signer).mint(daiAmount);
    await dai.connect(user.signer).approve(looping.address, principalDaiAmount);

    // User DAI balance
    expect(await dai.balanceOf(user.address)).eq(daiAmount);

    // Approval for looping contract to borrow for user
    await vDai.connect(user.signer).approveDelegation(looping.address, maxDepositedAmount);

    // Loop
    await looping
      .connect(user.signer)
      .loop(dai.address, principalDaiAmount, borrowRatio, loopCount);

    // User remaining DAI balance after looping
    expect(await dai.balanceOf(user.address)).eq(daiAmount.sub(principalDaiAmount));

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(dai.address, user.address);
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(maxDepositedAmount.toString()),
      Number(parseUnits('0.5', 18).toString())
    );
    expect(Number(userReserveData.currentVariableDebt.toString())).approximately(
      Number(maxBorrowedAmount.toString()),
      Number(parseUnits('0.5', 18).toString())
    );
  });

  it('(User 2) Looping DAI with max leverage', async () => {
    const { pool, users, helpersContract, looping, dai, vDai } = env;
    const user = users[2];

    // User DAI amount
    expect(await dai.balanceOf(user.address)).eq(BigNumber.from(0));

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(dai.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const { ltv } = await helpersContract.getReserveConfigurationData(dai.address);

    const daiAmount = parseUnits('600', 18); // 600 DAI
    const principalDaiAmount = parseUnits('500', 18); // 500 DAI
    const leverage = calcMaxLeverage(ltv);
    const maxDepositedAmount = principalDaiAmount.mul(leverage).div(PERCENTAGE_FACTOR);
    const maxBorrowedAmount = maxDepositedAmount.sub(principalDaiAmount);
    const { borrowRatio, loopCount } = calcLoopParams({
      leverageRaw: leverage,
      maxLtvRaw: ltv,
    });

    // Mint DAI for user
    await dai.connect(user.signer).mint(daiAmount);
    await dai.connect(user.signer).approve(looping.address, principalDaiAmount);

    // User DAI balance
    expect(await dai.balanceOf(user.address)).eq(daiAmount);

    // Approval for looping contract to borrow for user
    await vDai.connect(user.signer).approveDelegation(looping.address, maxDepositedAmount);

    // Loop
    await looping
      .connect(user.signer)
      .loop(dai.address, principalDaiAmount, borrowRatio, loopCount);

    // User remaining DAI balance after looping
    expect(await dai.balanceOf(user.address)).eq(daiAmount.sub(principalDaiAmount));

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(dai.address, user.address);
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(maxDepositedAmount.toString()),
      Number(parseUnits('3', 18).toString())
    );
    expect(Number(userReserveData.currentVariableDebt.toString())).approximately(
      Number(maxBorrowedAmount.toString()),
      Number(parseUnits('3', 18).toString())
    );

    const userAccountData = await pool.getUserAccountData(user.address);
    console.log('HealthFactor (DAI):', userAccountData.healthFactor);
  });

  it('(User 2) Looping USDC with max leverage with initial debt (DAI)', async () => {
    const { pool, users, helpersContract, looping, usdc, vUSDC } = env;
    const user = users[2]; // user 2 has loop the DAI with max leverage

    // User USDC amount
    expect(await usdc.balanceOf(user.address)).eq(BigNumber.from(0));

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(usdc.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const { ltv } = await helpersContract.getReserveConfigurationData(usdc.address);

    const usdcAmount = parseUnits('600', 6); // 600 USDC
    const principalUsdcAmount = parseUnits('500', 6); // 500 USDC
    const leverage = calcMaxLeverage(ltv);
    const maxDepositedAmount = principalUsdcAmount.mul(leverage).div(PERCENTAGE_FACTOR);
    const maxBorrowedAmount = maxDepositedAmount.sub(principalUsdcAmount);
    const { borrowRatio, loopCount } = calcLoopParams({
      leverageRaw: leverage,
      maxLtvRaw: ltv,
    });

    // Mint USDC for user
    await usdc.connect(user.signer).mint(usdcAmount);
    await usdc.connect(user.signer).approve(looping.address, principalUsdcAmount);

    // User USDC balance
    expect(await usdc.balanceOf(user.address)).eq(usdcAmount);

    // Approval for looping contract to borrow for user
    await vUSDC.connect(user.signer).approveDelegation(looping.address, maxBorrowedAmount);

    // Loop
    await looping
      .connect(user.signer)
      .loop(usdc.address, principalUsdcAmount, borrowRatio, loopCount);

    // User remaining USDC balance after looping
    expect(await usdc.balanceOf(user.address)).eq(usdcAmount.sub(principalUsdcAmount));

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(usdc.address, user.address);
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(maxDepositedAmount.toString()),
      Number(parseUnits('3', 6).toString())
    );
    expect(Number(userReserveData.currentVariableDebt.toString())).approximately(
      Number(maxBorrowedAmount.toString()),
      Number(parseUnits('3', 6).toString())
    );

    const userAccountData = await pool.getUserAccountData(user.address);
    console.log('HealthFactor (DAI + USDC):', userAccountData.healthFactor);
  });

  it('(User 3) Looping ETH with 3x leverage', async () => {
    const { users, helpersContract, looping, weth, vWETH } = env;
    const user = users[3];

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(weth.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const { ltv } = await helpersContract.getReserveConfigurationData(weth.address);
    const principalWethAmount = parseUnits('500', 18); // 500 WETH
    const leverage = BigNumber.from(PERCENTAGE_FACTOR).mul(3); // 3x
    const maxDepositedAmount = principalWethAmount.mul(leverage).div(PERCENTAGE_FACTOR);
    const maxBorrowedAmount = maxDepositedAmount.sub(principalWethAmount);
    const { borrowRatio, loopCount } = calcLoopParams({
      leverageRaw: leverage,
      maxLtvRaw: ltv,
    });

    // Approval for looping contract to borrow for user
    await vWETH.connect(user.signer).approveDelegation(looping.address, maxBorrowedAmount);

    // Loop
    await looping.connect(user.signer).loopETH(borrowRatio, loopCount, {
      value: principalWethAmount,
    });

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(weth.address, user.address);
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(maxDepositedAmount.toString()),
      Number(parseUnits('2', 18).toString())
    );
    expect(Number(userReserveData.currentVariableDebt.toString())).approximately(
      Number(maxBorrowedAmount.toString()),
      Number(parseUnits('2', 18).toString())
    );
  });

  it('(User 4) Looping ETH with max leverage', async () => {
    const { pool, users, helpersContract, looping, weth, vWETH } = env;
    const user = users[4];

    // User reserve data
    let userReserveData = await helpersContract.getUserReserveData(weth.address, user.address);
    expect(userReserveData.currentATokenBalance).eq(BigNumber.from(0));
    expect(userReserveData.currentVariableDebt).eq(BigNumber.from(0));

    const { ltv } = await helpersContract.getReserveConfigurationData(weth.address);
    const principalWethAmount = parseUnits('500', 18); // 500 WETH
    const leverage = calcMaxLeverage(ltv);
    const maxDepositedAmount = principalWethAmount.mul(leverage).div(PERCENTAGE_FACTOR);
    const maxBorrowedAmount = maxDepositedAmount.sub(principalWethAmount);
    const { borrowRatio, loopCount } = calcLoopParams({
      leverageRaw: leverage,
      maxLtvRaw: ltv,
    });

    // Approval for looping contract to borrow for user
    await vWETH.connect(user.signer).approveDelegation(looping.address, maxBorrowedAmount);

    // Loop
    await looping.connect(user.signer).loopETH(borrowRatio, loopCount, {
      value: principalWethAmount,
    });

    // User reserve data
    userReserveData = await helpersContract.getUserReserveData(weth.address, user.address);
    expect(Number(userReserveData.currentATokenBalance.toString())).approximately(
      Number(maxDepositedAmount.toString()),
      Number(parseUnits('3', 18).toString())
    );
    expect(Number(userReserveData.currentVariableDebt.toString())).approximately(
      Number(maxBorrowedAmount.toString()),
      Number(parseUnits('3', 18).toString())
    );

    const userAccountData = await pool.getUserAccountData(user.address);
    console.log('HealthFactor (ETH):', userAccountData.healthFactor);
  });
});

function calcLoopParams({
  leverageRaw,
  maxLtvRaw,
}: {
  leverageRaw: BigNumber;
  maxLtvRaw: BigNumber;
}): {
  loopCount: number;
  borrowRatio: BigNumber;
} {
  // leverage < 1
  if (leverageRaw.lt(PERCENTAGE_FACTOR)) {
    throw Error(`leverageRaw should >= ${PERCENTAGE_FACTOR}`);
  }

  // leverage = 1, no loop
  if (leverageRaw.eq(PERCENTAGE_FACTOR)) {
    return {
      loopCount: 0,
      borrowRatio: BigNumber.from(0),
    };
  }

  // 1 < leverage <= 1 + ltv, loop once
  if (leverageRaw <= maxLtvRaw.add(PERCENTAGE_FACTOR)) {
    return {
      loopCount: 1,
      borrowRatio: leverageRaw.sub(PERCENTAGE_FACTOR),
    };
  }

  // leverage > 1 + ltv, loop many times
  let maxLeverage: BigNumber;
  for (let loopCount = 2; loopCount <= MAX_LOOP_COUNT; loopCount++) {
    maxLeverage = calcLeverage({ loopCount: loopCount, borrowRatio: maxLtvRaw });
    if (leverageRaw.lte(maxLeverage)) {
      return {
        loopCount: loopCount,
        borrowRatio: calcBorrowRatio({
          leverageRaw,
          loopCount,
          maxLtvRaw,
        }),
      };
    }
  }

  throw Error(`Leverage too large, must less than ${maxLeverage!}, given: ${leverageRaw}`);
}

function calcMaxLeverage(maxLtv: BigNumber): BigNumber {
  return calcLeverage({
    loopCount: MAX_LOOP_COUNT,
    borrowRatio: maxLtv,
  });
}

function calcLeverage({
  loopCount,
  borrowRatio,
}: {
  loopCount: number;
  borrowRatio: BigNumber;
}): BigNumber {
  let each = BigNumber.from(PERCENTAGE_FACTOR);
  let leverage = each;
  for (let i = 0; i < loopCount; i++) {
    each = each.mul(borrowRatio).div(PERCENTAGE_FACTOR);
    leverage = leverage.add(each);
  }
  return leverage;
}

function calcBorrowRatio({
  leverageRaw,
  loopCount,
  maxLtvRaw,
}: {
  leverageRaw: BigNumber;
  loopCount: number;
  maxLtvRaw: BigNumber;
}) {
  return binarySearchBorrowRatio({
    leverageRaw,
    loopCount,
    borrowRatioLeft: BigNumber.from(0),
    borrowRatioRight: maxLtvRaw,
    recursionCount: 0,
  });
}

function binarySearchBorrowRatio({
  leverageRaw,
  loopCount,
  borrowRatioLeft,
  borrowRatioRight,
  recursionCount,
}: {
  leverageRaw: BigNumber;
  loopCount: number;
  borrowRatioLeft: BigNumber;
  borrowRatioRight: BigNumber;
  recursionCount: number;
}): BigNumber {
  if (recursionCount > 100) {
    throw Error('Exceed max recursion');
  }

  const borrowRatio = borrowRatioLeft.add(borrowRatioRight).div(2);
  const calculatedLeverageRaw = calcLeverage({ loopCount: loopCount, borrowRatio });
  const error = 100; // 0.01
  if (calculatedLeverageRaw.sub(leverageRaw).abs().lte(error)) {
    return borrowRatio;
  } else if (calculatedLeverageRaw.lt(leverageRaw)) {
    borrowRatioLeft = borrowRatio;
  } else {
    borrowRatioRight = borrowRatio;
  }

  return binarySearchBorrowRatio({
    leverageRaw,
    loopCount: loopCount,
    borrowRatioLeft,
    borrowRatioRight,
    recursionCount: recursionCount + 1,
  });
}
