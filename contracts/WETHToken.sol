// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// small edit
contract WETHToken is ERC20 {
    constructor() ERC20("Wrapped ETHER", "WETH") {
        _mint(msg.sender, 9999 ether);
    }
}