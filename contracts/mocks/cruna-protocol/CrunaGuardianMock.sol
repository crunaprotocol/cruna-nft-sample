// SPDX-License-Identifier: GPL3
pragma solidity ^0.8.0;

import {CrunaGuardian} from "@cruna/protocol/guardian/CrunaGuardian.sol";

contract CrunaGuardianMock is CrunaGuardian {
  constructor(
    uint256 minDelay,
    address firstProposer,
    address firstExecutor,
    address admin
  ) CrunaGuardian(minDelay, firstProposer, firstExecutor, admin) {}
}
