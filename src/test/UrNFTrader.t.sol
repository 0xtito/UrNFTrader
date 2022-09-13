// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.7;

import {DSTest} from "../../lib/ds-test/src/test.sol";
import {DSTestPlus} from "../../lib/solmate/src/test/utils/DSTestPlus.sol";
import {DSInvariantTest} from "../../lib/solmate/src/test/utils/DSInvariantTest.sol";
import {SafeTransferLib} from "../../lib/solmate/src/utils/SafeTransferLib.sol";

import { UrNFTrader } from "../UrNFTrader.sol";
import { IMulticall3 } from "./mocks/IMulticall3.sol";
import { Multicall3 } from "./mocks/Multicall3.sol";

import { WETH } from "../../lib/solmate/src/tokens/WETH.sol";

interface IWETH {
    function balanceOf(address) external returns (uint);
    function deposit() external payable;
    function withdraw(uint) external;
    function totalSupply() external returns (uint);
}

contract UrNFTraderTest is DSTest {
    UrNFTrader urnftrader;
    IWETH weth;
    IMulticall3 Imulticall;
    Multicall3 multicall;
    // rinkeby
    address wethAddress = 0xc778417E063141139Fce010982780140Aa0cD5Ab;
    address multicallAddress = 0xcA11bde05977b3631167028862bE2a173976CA11;
    address thisAddress = 0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84;

    function setUp() public {
        // urnftrader = new UrNFTrader();
        // weth = new WETH();
        weth = IWETH(wethAddress);
        Imulticall = IMulticall3(multicallAddress);
        multicall = new Multicall3();
        // multicall = Multicall3(multicallAddress);


    }

    function testDeposit() public {
        assertEq(weth.balanceOf(address(this)), 0);
        weth.deposit{value: 1 ether}();
        assertEq(weth.balanceOf(address(this)), 1 ether);
    }

    // function testWithdraw(uint256 depositAmount, uint256 withdrawAmount) public {
    //     depositAmount = bound(depositAmount, 0, address(this).balance);
    //     withdrawAmount = bound(withdrawAmount, 0, depositAmount);

    //     weth.deposit{value: depositAmount}();

    //     uint256 balanceBeforeWithdraw = address(this).balance;

    //     weth.withdraw(withdrawAmount);

    //     uint256 balanceAfterWithdraw = address(this).balance;

    //     assertEq(balanceAfterWithdraw, balanceBeforeWithdraw + withdrawAmount);
    //     assertEq(weth.balanceOf(address(this)), depositAmount - withdrawAmount);
    //     assertEq(weth.totalSupply(), depositAmount - withdrawAmount);
    // }

    function testPartialWithdraw() public {
        weth.deposit{value: 1 ether}();
        uint startingBalance = weth.balanceOf(address(this));

        weth.withdraw(0.5 ether);
        uint256 balanceAfterWithdraw = weth.balanceOf(address(this));

        assertEq(startingBalance - balanceAfterWithdraw, 0.5 ether);
    }

    function testBalanceOf() public {
        assertEq(weth.balanceOf(address(this)), 0);
    }
    // using the imported interface
    function testIMultiCall() public {
        IMulticall3.Call3Value[] memory Icalls = new IMulticall3.Call3Value[](3);

        uint startingBalanceMulti = weth.balanceOf(address(this));

        Icalls[0] = IMulticall3.Call3Value(wethAddress, true, 1 ether, abi.encodeWithSignature("deposit()"));
        Icalls[1] = IMulticall3.Call3Value(wethAddress, true, 0, abi.encodeWithSignature("balanceOf(address)", multicallAddress));
        Icalls[2] = IMulticall3.Call3Value(wethAddress, true, 0, abi.encodeWithSignature("transfer(address,uint256)", address(this), 1 ether));

        (IMulticall3.Result[] memory returnData) = Imulticall.aggregate3Value{ value: 1 ether}(Icalls);

        assertTrue(returnData[0].success);
        assertTrue(returnData[1].success);
        assertTrue(returnData[2].success);
        uint endBalanceMulti = weth.balanceOf(address(this));
        assertEq(endBalanceMulti, startingBalanceMulti + 1 ether);

    }

    // --- using the imported contract ---
    function testMultiCall() public {
        // uint startingBalance = weth.balanceOf(address(this));
        // IMulticall3.Call3Value[] memory calls = new IMulticall3.Call3Value[](1);
        Multicall3.Call3Value[] memory calls = new Multicall3.Call3Value[](3);

        uint startingBalanceMulti = weth.balanceOf(address(this));
        // calls[0] = IMulticall3.Call3Value(wethAddress, true, 1, abi.encodeWithSignature("deposit()"));
        calls[0] = Multicall3.Call3Value(wethAddress, true, 1 ether, abi.encodeWithSignature("deposit()"));

        calls[1] = Multicall3.Call3Value(wethAddress, true, 0, abi.encodeWithSignature("balanceOf(address)", multicallAddress));
        calls[2] = Multicall3.Call3Value(wethAddress, true, 0, abi.encodeWithSignature("transfer(address,uint256)", address(this), 1 ether));
        (Multicall3.Result[] memory returnData) = multicall.aggregate3Value{ value: 1 ether}(calls);

        assertTrue(returnData[0].success);
        assertTrue(returnData[1].success);
        assertTrue(returnData[2].success);
        uint endBalanceMulti = weth.balanceOf(address(this));
        assertEq(endBalanceMulti, startingBalanceMulti + 1 ether);
        // assertEq(endBalanceMulti, endBalanceMulti - startingBalanceMulti);
        // assertTrue(returnData[2].success);

        // assertEq(keccak256(returnData[0].returnData), keccak256(abi.encodePacked(uint256(1 ether))));
        // uint afterWithdrawBalance = weth.balanceOf(address(this));
        // assertEq(afterWithdrawBalance - startingBalance, 1 ether);

    }

    receive() external payable {} 
}

// pragma solidity 0.8.7;

// import {DSTestPlus} from "./utils/DSTestPlus.sol";
// import {DSInvariantTest} from "./utils/DSInvariantTest.sol";


// import {WETH} from "../tokens/WETH.sol";

// import { UrNFTrader } from "../UrNFTrader.sol";
// import { IMulticall3 } from "./mocks/IMulticall3.sol";

// import { WETH } from "../../lib/solmate/src/tokens/WETH.sol";

// contract WETHTest is DSTestPlus {
//     WETH weth;

//     function setUp() public {
//         weth = new WETH();
//     }

//     function testFallbackDeposit() public {
//         assertEq(weth.balanceOf(address(this)), 0);
//         assertEq(weth.totalSupply(), 0);

//         SafeTransferLib.safeTransferETH(address(weth), 1 ether);

//         assertEq(weth.balanceOf(address(this)), 1 ether);
//         assertEq(weth.totalSupply(), 1 ether);
//     }

//     function testDeposit() public {
//         assertEq(weth.balanceOf(address(this)), 0);
//         assertEq(weth.totalSupply(), 0);

//         weth.deposit{value: 1 ether}();

//         assertEq(weth.balanceOf(address(this)), 1 ether);
//         assertEq(weth.totalSupply(), 1 ether);
//     }

//     function testWithdraw() public {
//         uint256 startingBalance = address(this).balance;

//         weth.deposit{value: 1 ether}();

//         weth.withdraw(1 ether);

//         uint256 balanceAfterWithdraw = address(this).balance;

//         assertEq(balanceAfterWithdraw, startingBalance);
//         assertEq(weth.balanceOf(address(this)), 0);
//         assertEq(weth.totalSupply(), 0);
//     }

//     function testPartialWithdraw() public {
//         weth.deposit{value: 1 ether}();

//         uint256 balanceBeforeWithdraw = address(this).balance;

//         weth.withdraw(0.5 ether);

//         uint256 balanceAfterWithdraw = address(this).balance;

//         assertEq(balanceAfterWithdraw, balanceBeforeWithdraw + 0.5 ether);
//         assertEq(weth.balanceOf(address(this)), 0.5 ether);
//         assertEq(weth.totalSupply(), 0.5 ether);
//     }

//     function testFallbackDeposit(uint256 amount) public {
//         amount = bound(amount, 0, address(this).balance);

//         assertEq(weth.balanceOf(address(this)), 0);
//         assertEq(weth.totalSupply(), 0);

//         SafeTransferLib.safeTransferETH(address(weth), amount);

//         assertEq(weth.balanceOf(address(this)), amount);
//         assertEq(weth.totalSupply(), amount);
//     }

//     function testDeposit(uint256 amount) public {
//         amount = bound(amount, 0, address(this).balance);

//         assertEq(weth.balanceOf(address(this)), 0);
//         assertEq(weth.totalSupply(), 0);

//         weth.deposit{value: amount}();

//         assertEq(weth.balanceOf(address(this)), amount);
//         assertEq(weth.totalSupply(), amount);
//     }

//     function testWithdraw(uint256 depositAmount, uint256 withdrawAmount) public {
//         depositAmount = bound(depositAmount, 0, address(this).balance);
//         withdrawAmount = bound(withdrawAmount, 0, depositAmount);

//         weth.deposit{value: depositAmount}();

//         uint256 balanceBeforeWithdraw = address(this).balance;

//         weth.withdraw(withdrawAmount);

//         uint256 balanceAfterWithdraw = address(this).balance;

//         assertEq(balanceAfterWithdraw, balanceBeforeWithdraw + withdrawAmount);
//         assertEq(weth.balanceOf(address(this)), depositAmount - withdrawAmount);
//         assertEq(weth.totalSupply(), depositAmount - withdrawAmount);
//     }

//     receive() external payable {}
// }

// contract WETHInvariants is DSTestPlus, DSInvariantTest {
//     WETHTester wethTester;
//     WETH weth;

//     function setUp() public {
//         weth = new WETH();
//         wethTester = new WETHTester{value: address(this).balance}(weth);

//         addTargetContract(address(wethTester));
//     }

//     function invariantTotalSupplyEqualsBalance() public {
//         assertEq(address(weth).balance, weth.totalSupply());
//     }
// }

// contract WETHTester {
//     WETH weth;

//     constructor(WETH _weth) payable {
//         weth = _weth;
//     }

//     function deposit(uint256 amount) public {
//         weth.deposit{value: amount}();
//     }

//     function fallbackDeposit(uint256 amount) public {
//         SafeTransferLib.safeTransferETH(address(weth), amount);
//     }

//     function withdraw(uint256 amount) public {
//         weth.withdraw(amount);
//     }

//     receive() external payable {}
// }
