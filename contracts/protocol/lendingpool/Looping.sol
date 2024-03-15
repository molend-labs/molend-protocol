// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ILendingPool} from '../../interfaces/ILendingPool.sol';
import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';
import {IFlashLoanReceiver} from "../../flashloan/interfaces/IFlashLoanReceiver.sol";
import "../../misc/interfaces/IWETH.sol";

contract Looping is IFlashLoanReceiver {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  ILendingPoolAddressesProvider public immutable override ADDRESSES_PROVIDER;
  ILendingPool public immutable override LENDING_POOL;
  IWETH internal immutable WETH;

  constructor(ILendingPoolAddressesProvider provider, IWETH weth) public {
    ADDRESSES_PROVIDER = provider;
    LENDING_POOL = ILendingPool(provider.getLendingPool());
    WETH = weth;
  }

  /// This function is called by lending pool after your contract has received the flash loaned amount
  /// @param assets  flashloan received assets
  /// @param amounts  flashloan received asset amounts
  /// @param premiums  flashloan assets premium amounts
  /// @param initiator  flashloan initiator
  /// @param params  flashloan parameters
  function executeOperation(
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata premiums,
    address initiator,
    bytes calldata params
  ) external override returns (bool) {
    (
      address payable user,
      address asset,
      uint256 principal,
      uint256 borrowed,
      uint256 value
    ) = abi.decode(params, (address, address, uint256, uint256, uint256));

    require(
      assets.length == 1 &&
      assets[0] == asset &&
      amounts.length == 1 &&
      amounts[0] == borrowed &&
      premiums.length == 1,
      "Unexpected FlashLoan"
    );

    uint256 premuim = premiums[0];
    uint256 principalPlusPremuim = principal.add(premuim);

    if (asset == address(WETH)) {
      require(value >= principalPlusPremuim, "Insufficient attached ETH as FlightLoan fee");
      WETH.deposit{value: principalPlusPremuim}();
      uint256 extra = value - principalPlusPremuim;
      if (extra > 0) {
        user.transfer(extra);
      }
    } else {
      require(value == 0, "Don't attach any Ether");
      IERC20(asset).safeTransferFrom(user, address(this), principalPlusPremuim);
    }

    // deposit (borrowed + principal) to LendingPool
    // now this contract owned: (premuim)
    uint256 deposit = borrowed.add(principal);
    IERC20(asset).safeApprove(address(LENDING_POOL), deposit);
    LENDING_POOL.deposit(asset, deposit, user, 0);

    // borrow (borrowed) from LendingPool
    // now this contract owned: (borrowed + premuim)
    LENDING_POOL.borrow(asset, borrowed, 2, 0, user); // TODO interestRateMode

    // Approve the LendingPool contract allowance to *pull* the owed amount
    // i.e. AAVE V2's way of repaying the flash loan
    uint256 amountOwing = borrowed.add(premuim);
    IERC20(asset).safeApprove(address(LENDING_POOL), amountOwing);

    return true;
  }

  // One click loop
  // Before call loop, user should approve (principal + falshloan premium) asset to this contract
  function loop(
    address asset,
    uint256 principal,
    uint256 borrowed
  ) external payable {
    if (asset == address(WETH)) {
      require(msg.value >= principal, "Attached Ether should grater or equal than principal");
    }

    address[] memory assets = new address[](1);
    assets[0] = asset;

    uint256[] memory amounts = new uint256[](1);
    amounts[0] = borrowed;

    uint256[] memory modes = new uint256[](1);
    modes[0] = 0;

    bytes memory params = abi.encode(msg.sender, asset, principal, borrowed, msg.value);

    LENDING_POOL.flashLoan(
      address(this),
      assets,
      amounts,
      modes,
      address(this),
      params,
      0
    );
  }
}
