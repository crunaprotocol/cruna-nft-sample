// SPDX-License-Identifier: GPL3
pragma solidity ^0.8.20;

import {CrunaProtectedNFTOwnable} from "@cruna/protocol/token/CrunaProtectedNFTOwnable.sol";

//import "hardhat/console.sol";

// @dev This contract is a simple example of a protected NFT.
contract SerpentShields is CrunaProtectedNFTOwnable {
  error NotTheFactory();

  address public factory;

  // @dev This modifier will only allow the factory to call the function.
  //   The factory is the contract that manages the sale of the tokens.
  modifier onlyFactory() {
    if (factory == address(0) || _msgSender() != factory) revert NotTheFactory();
    _;
  }

  // @dev This constructor will initialize the contract with the necessary parameters
  //   The contracts of whom we pass the addresses in the construction, will be deployed
  //   using Nick's factory, so we may in theory hardcode them in the code. However,
  //   if so, we will not be able to test the contract.
  // @param owner The address of the owner.
  constructor(address owner) CrunaProtectedNFTOwnable("SerpentShields", "LW", owner) {}

  // @dev Set factory to 0x0 to disable a factory.
  // @notice This is the only function that can be called by the owner.
  //   It does not introduce centralization, because it is related with
  //   the factory that sells the tokens, not the NFT itself.
  // @param factory The address of the factory.
  function setFactory(address factory_) external virtual onlyOwner {
    if (factory_ == address(0)) revert ZeroAddress();
    factory = factory_;
  }

  // @dev This function will mint a new token
  // @param to The address of the recipient
  function safeMintAndActivate(address to, uint256 amount) public virtual onlyFactory {
    _mintAndActivate(to, amount);
  }
}
