// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Memeloom.sol";

contract DeployMemeloom is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        Memeloom loom = new Memeloom();
        console.log("Memeloom deployed at:", address(loom));
        console.log("Total supply:", loom.totalSupply());

        vm.stopBroadcast();
    }
}
