// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "forge-std/Test.sol";
import "./interfaces/IWETH9.sol";
import "./interfaces/IUni_Router_V2.sol";
import "./interfaces/IUni_Pair_V2.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IERC20.sol";

contract ContractTest is Test {
  WETH9 weth = WETH9(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
  Uni_Pair_V2 uniswapV2Pair = Uni_Pair_V2(0xd3d2E2692501A5c9Ca623199D38826e513033a17);
  IUniswapV2Router02 router = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
  IUniswapV2Factory factory = IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);
  IERC20 usdt = IERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7);
  IERC20 middle_token = IERC20(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599); //wbtc
  IERC20 dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);


  function setUp() public {
    vm.createSelectFork("mainnet", 	20100303); //fork mainnet at block 15012670 
  }

  function testUniswapv2_flashswap() public {
    weth.deposit{ value: 1 ether }();
    Uni_Pair_V2(uniswapV2Pair).swap(0, 1 * 1e18, address(this), "0x00");
  }

  function makeSwap(uint amountIn, uint amountOutMin, address token0, address token1) public {
    IERC20(token0).approve(address(router), amountIn);
    address[] memory path = new address[](2);
    path[0] = token0;
    path[1] = token1;
    router.swapExactTokensForTokens(amountIn, amountOutMin, path, address(this), block.timestamp);
  }

  function uniswapV2Call(
    address sender,
    uint256 amount0,
    uint256 amount1,
    bytes calldata data
  ) external {
    emit log_named_decimal_uint(
      "Before flashswap, WETH balance of user:",
      weth.balanceOf(address(this)),
      18
    );

    makeSwap(weth.balanceOf(address(this)), 1, address(weth), address(dai));
    emit log_named_decimal_uint("DAI balance:", dai.balanceOf(address(this)), 18);

    makeSwap(dai.balanceOf(address(this)), 1, address(dai), address(middle_token));
    emit log_named_decimal_uint("WBTC balance:", middle_token.balanceOf(address(this)), 8);

    makeSwap(middle_token.balanceOf(address(this)), 1, address(middle_token), address(weth));
    emit log_named_decimal_uint("WETH balance:", weth.balanceOf(address(this)), 18);
    
    // 0.3% fees
    uint256 fee = ((amount1 * 3) / 997) + 1;
    uint256 amountToRepay = amount1 + fee;
    emit log_named_decimal_uint("Amount to repay:", amountToRepay,18);

    weth.transfer(address(uniswapV2Pair), amountToRepay);

    emit log_named_decimal_uint(
      "After flashswap, WETH balance of user:",
      weth.balanceOf(address(this)),
      18
    );
  }
  
  receive() external payable {}
}
