// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ILendingPool} from '../interfaces/ILendingPool.sol';
import {ILendingPoolAddressesProvider} from '../interfaces/ILendingPoolAddressesProvider.sol';
import {IWETH} from "./interfaces/IWETH.sol";

contract Looping {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;
  uint256 public constant RATIO_DIVISOR = 10000;

  ILendingPoolAddressesProvider public immutable ADDRESSES_PROVIDER;
  ILendingPool public immutable LENDING_POOL;
  IWETH internal immutable WETH;

  event Loop (address user, address asset, uint256 principal, uint256 deposited, uint256 borrowed, uint256 borrowRatio, uint256 loopCount);
  event LoopETH (address user, uint256 principal, uint256 deposited, uint256 borrowed, uint256 borrowRatio, uint256 loopCount);

  constructor(ILendingPoolAddressesProvider provider, IWETH weth) public {
    ADDRESSES_PROVIDER = provider;
    LENDING_POOL = ILendingPool(provider.getLendingPool());
    WETH = weth;
  }

  function getWETHAddress() external view returns (address) {
    return address(WETH);
  }

  function loop(
    address asset,
    uint256 amount,
    uint256 borrowRatio,
    uint256 loopCount
  ) external {
    require(borrowRatio <= RATIO_DIVISOR, "Invalid ratio");
    address user = msg.sender;

    IERC20(asset).safeTransferFrom(user, address(this), amount);

    (uint256 deposited, uint256 borrowed) = internalLoop(user, asset, amount, borrowRatio, loopCount);
    emit Loop(user, asset, amount, deposited, borrowed, borrowRatio, loopCount);
  }

  function loopETH(
    uint256 borrowRatio,
    uint256 loopCount
  ) external payable {
    require(borrowRatio <= RATIO_DIVISOR, "Invalid ratio");
    address user = msg.sender;

    uint256 amount = msg.value;
    require(amount > 0, "Need to attach Ether");
    WETH.deposit{value: amount}();

    (uint256 deposited, uint256 borrowed) = internalLoop(user, address(WETH), amount, borrowRatio, loopCount);
    emit LoopETH(user, amount, deposited, borrowed, borrowRatio, loopCount);
  }

  function internalLoop(
    address user,
    address asset,
    uint256 amount,
    uint256 borrowRatio,
    uint256 loopCount
  ) internal returns (uint256, uint256) {
    if (IERC20(asset).allowance(address(this), address(LENDING_POOL)) == 0) {
        require(IERC20(asset).approve(address(LENDING_POOL), uint256(-1)), "Failed to approve");
    }

    uint256 deposited = 0;
    uint256 borrowed = 0;

    for (uint256 i = 0; i < loopCount; i++) {
      LENDING_POOL.deposit(asset, amount, user, 0);
      deposited += amount;
      amount = amount.mul(borrowRatio).div(RATIO_DIVISOR);
      LENDING_POOL.borrow(asset, amount, 2, 0, user);
      borrowed += amount;
    }

    LENDING_POOL.deposit(asset, amount, user, 0);
    deposited += amount;

    return (deposited, borrowed);
  }
}
