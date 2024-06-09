/**
 *Submitted for verification at Etherscan.io on 2020-08-06
 */
pragma solidity 0.6.6;


interface IPriceFeed {
    function latestRoundData() view external returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}