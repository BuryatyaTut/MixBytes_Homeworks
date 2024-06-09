// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract ITMOToken is ERC20, Ownable{
    constructor() ERC20("ItmoToken", "ITM") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}