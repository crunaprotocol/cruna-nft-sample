// SPDX-License-Identifier: GPL3
pragma solidity ^0.8.0;

import {CrunaGuardian} from "@cruna/protocol/canonical/CrunaGuardian.sol";

contract CrunaGuardianMock is CrunaGuardian {
  constructor(
    uint256 minDelay,
    address[] memory proposers,
    address[] memory executors,
    address admin
  ) CrunaGuardian(minDelay, proposers, executors, admin) {}
}
