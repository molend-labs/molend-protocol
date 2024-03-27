// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

interface IWETH {
  function deposit() external payable;

  function withdraw(uint256) external;

  function approve(address guy, uint256 wad) external returns (bool);

  function allowance(address owner, address spender) external view returns (uint256);

  function transferFrom(
    address src,
    address dst,
    uint256 wad
  ) external returns (bool);
}
