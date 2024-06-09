// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Storage {
    mapping(address => string) public userToHash;

    event hashUpdated(string msg, string _hash);
    event hashGet(string msg, string _hash);

    function updateHash(string memory hash) public {
        userToHash[msg.sender] = hash;
        emit hashUpdated("new hash value is ", hash);
    }

    function getHash() external returns (string memory) {
        string memory hash = userToHash[msg.sender];
        emit hashGet("sender got hash", hash);
        return hash;
    }
}
