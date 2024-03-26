// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ILendingPool} from '../../interfaces/ILendingPool.sol';
import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';
import "../../misc/interfaces/IWETH.sol";

contract Looping {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;
  uint256 public constant RATIO_DIVISOR = 10000;

  ILendingPoolAddressesProvider public immutable ADDRESSES_PROVIDER;
  ILendingPool public immutable LENDING_POOL;
  IWETH internal immutable WETH;

  constructor(ILendingPoolAddressesProvider provider, IWETH weth) public {
    ADDRESSES_PROVIDER = provider;
    LENDING_POOL = ILendingPool(provider.getLendingPool());
    WETH = weth;
  }

  function getWETHAddress() external view returns (address) {
    return address(WETH);
  }

  // One click loop
  // Before call loop
  // User should approve (principal + flashloan premium) asset to this contract
  function loop(
    address asset,
    uint256 amount,
    uint256 borrowRatio,
    uint256 borrowCount
  ) external {
    require(borrowRatio <= RATIO_DIVISOR, "Invalid ratio");
    address user = msg.sender;

    IERC20(asset).safeTransferFrom(user, address(this), amount);

    if (IERC20(asset).allowance(address(this), address(LENDING_POOL)) == 0) {
        IERC20(asset).safeApprove(address(LENDING_POOL), uint256(-1));
    }

    internalLoop(user, asset, amount, borrowRatio, borrowCount);
  }

  // One click loop
  // Before call loop
  // User should attach (principal + flashloan premium) Ether to this contract
  function loopETH(
    uint256 borrowRatio,
    uint256 borrowCount
  ) external payable {
    require(borrowRatio <= RATIO_DIVISOR, "Invalid ratio");
    address user = msg.sender;

    uint256 amount = msg.value;
    require(amount > 0, "Need to attach Ether");
    WETH.deposit{value: amount}();

    internalLoop(user, address(WETH), amount, borrowRatio, borrowCount);
  }

  function internalLoop(
    address user,
    address asset,
    uint256 amount,
    uint256 borrowRatio,
    uint256 borrowCount
  ) internal {
    for (uint256 i = 0; i < borrowCount; i++) {
      LENDING_POOL.deposit(asset, amount, user, 0);
      amount = amount.mul(borrowRatio).div(RATIO_DIVISOR);
      LENDING_POOL.borrow(asset, amount, 2, 0, user);
    }

    LENDING_POOL.deposit(asset, amount, user, 0);
  }
}
