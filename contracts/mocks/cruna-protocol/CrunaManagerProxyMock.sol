// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {CrunaManagerProxy} from "@cruna/protocol/manager/CrunaManagerProxy.sol";

contract CrunaManagerProxyMock is CrunaManagerProxy {
  constructor(address _initialImplementation) CrunaManagerProxy(_initialImplementation) {}
}
