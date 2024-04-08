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
  IWETH internal immutable WETH;

  event Loop (address user, address asset, uint256 principal, uint256 deposited, uint256 borrowed, uint256 borrowRatio, uint256 loopCount);
  event LoopETH (address user, uint256 principal, uint256 deposited, uint256 borrowed, uint256 borrowRatio, uint256 loopCount);

  constructor(ILendingPoolAddressesProvider provider, IWETH weth) public {
    ADDRESSES_PROVIDER = provider;
    WETH = weth;
  }

  function lendingPool() public view returns (ILendingPool) {
    return ILendingPool(ADDRESSES_PROVIDER.getLendingPool());
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

    (uint256 deposited, uint256 borrowed) = internalLoop(lendingPool(), user, asset, amount, borrowRatio, loopCount);
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

    (uint256 deposited, uint256 borrowed) = internalLoop(lendingPool(), user, address(WETH), amount, borrowRatio, loopCount);
    emit LoopETH(user, amount, deposited, borrowed, borrowRatio, loopCount);
  }

  function internalLoop(
    ILendingPool lendingPool,
    address user,
    address asset,
    uint256 amount,
    uint256 borrowRatio,
    uint256 loopCount
  ) internal returns (uint256, uint256) {
    if (IERC20(asset).allowance(address(this), address(lendingPool)) == 0) {
        IERC20(asset).safeApprove(address(lendingPool), uint256(-1));
    }

    uint256 deposited = 0;
    uint256 borrowed = 0;

    for (uint256 i = 0; i < loopCount; i++) {
      lendingPool.deposit(asset, amount, user, 0);
      deposited += amount;
      amount = amount.mul(borrowRatio).div(RATIO_DIVISOR);
      lendingPool.borrow(asset, amount, 2, 0, user);
      borrowed += amount;
    }

    lendingPool.deposit(asset, amount, user, 0);
    deposited += amount;

    return (deposited, borrowed);
  }
}
