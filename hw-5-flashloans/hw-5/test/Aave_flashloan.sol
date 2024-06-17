// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "forge-std/Test.sol";
import "./interfaces/ILendingPool.sol";
import "./interfaces/IUni_Router_V2.sol";
import "./interfaces/IERC20.sol";

contract ContractTest is Test {
  using SafeMath for uint;
  IERC20 wbtc = IERC20(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599);
  IERC20 usdt = IERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7);
  IERC20 middle_token = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2); // weth
  IERC20 dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

  ILendingPool aaveLendingPool =
    ILendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);

  IUniswapV2Router02 router = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

  address[] assets = [0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599];
  uint256[] amounts = [1_00000000];
  uint256[] modes = [0];

  event Log(string message, uint val);
  function setUp() public {
    vm.createSelectFork("mainnet", 15141656);
  }

  function makeSwap(uint amountIn, uint amountOutMin, address token0, address token1) public {
    IERC20(token0).approve(address(router), amountIn);
    address[] memory path = new address[](2);
    path[0] = token0;
    path[1] = token1;
    router.swapExactTokensForTokens(amountIn, amountOutMin, path, address(this), block.timestamp);
  }

  function testAave_flashloan() public {
    vm.prank(0x218B95BE3ed99141b0144Dba6cE88807c4AD7C09);

    wbtc.transfer(address(this),1_00000000);
    emit log_named_decimal_uint("Before flashloan, balance of wbtc:", wbtc.balanceOf(address(this)), 8);

    aaveLendingPool.flashLoan(
      address(this),
      assets,
      amounts,
      modes,
      address(this),
      "0x",
      0
    );
    emit log_named_decimal_uint("After flashloan repaid, balance of wbtc:",wbtc.balanceOf(address(this)), 8);
  }

  function executeOperation(
    address[] memory assets,
    uint256[] memory amounts,
    uint256[] memory premiums,
    address initiator,
    bytes memory params
  ) public returns (bool) {

    emit log_named_decimal_uint("With Flashloan WBTC balance: ", wbtc.balanceOf(address(this)), 8);

    makeSwap(wbtc.balanceOf(address(this)), 1, address(wbtc), address(dai));
    emit log_named_decimal_uint("DAI balance:", dai.balanceOf(address(this)), 18);

    makeSwap(dai.balanceOf(address(this)), 1, address(dai), address(middle_token));
    emit log_named_decimal_uint("middle_token balance:", middle_token.balanceOf(address(this)), 18);

    makeSwap(middle_token.balanceOf(address(this)), 1, address(middle_token), address(wbtc));
    emit log_named_decimal_uint("WBTC balance:", wbtc.balanceOf(address(this)), 8);

    for (uint i = 0; i < assets.length; i++) {
      console.log("in cycle %s", i + 1);
      emit log_named_decimal_uint("borrowed:", amounts[i], 8);
      emit log_named_decimal_uint("fee: ", premiums[i], 8);
      uint amountOwing = amounts[i].add(premiums[i]);
      wbtc.approve(address(aaveLendingPool), amountOwing);
      //If don't have insufficient balance, will trigger Reason: SafeERC20: low-level call failed.
    }
    return true;
  }

  receive() external payable {}
}