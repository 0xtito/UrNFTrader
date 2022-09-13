// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.7;

import {DSTest} from "../../lib/ds-test/src/test.sol";

import { UrNFTrader } from "../UrNFTrader.sol";
import { IMulticall3 } from "./mocks/IMulticall3.sol";
import { WETH } from "../../lib/solmate/tokens/WETH.sol";

contract UrNFTraderTest is DSTest {
    UrNFTrader urnftrader;
    WETH weth;
    IMulticall3 multicall;
    address wethAddress = 0xc778417E063141139Fce010982780140Aa0cD5Ab;

    function setUp() public {
        urnftrader = new UrNFTrader();
        weth = WETH(wethAddress);
        multicall = IMulticall3(0xcA11bde05977b3631167028862bE2a173976CA11);
    }

    function testWrap() public {
        assertEq(weth.balanceOf(address(this)), 0);
        weth.deposit{value: 1 ether}();
        assertEq(weth.balanceOf(address(this)), 1 ether);
        // weth.withdraw(0.5 ether);
        // assertEq(weth.balanceOf(address(this)), 0.5 ether);
    }

    function testMultiCall() view public {
        IMulticall3.Call3Value[] memory calls = new IMulticall3.Call3Value[](3);
        calls[0] = IMulticall3.Call3Value(wethAddress, false, 1, abi.encodeWithSignature("deposit()"));
    }
}
