// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract ItmoVotingToken is ERC20Votes {
    constructor() ERC20("ItmoVotingToken", "VTK") EIP712("ItmoVotingToken", "1.0") {
        _mint(msg.sender, _maxSupply());
    }

    function _maxSupply() internal view virtual override returns (uint256) {
        return uint256(100 * 10 ** decimals());
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}