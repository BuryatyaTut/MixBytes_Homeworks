// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Time} from "@openzeppelin/contracts/utils/types/Time.sol";
import "hardhat/console.sol";

contract Voting {
    ERC20Votes votingToken;

    uint16 freeId = 1;
    uint threshold;
    uint16 INF = 1e3;
    // uint16 proposalsAmount = 3;

    struct Proposal{
        uint256 phash;
        uint startTime;
        uint endTime;
        uint amountFor;
        uint amountAgainst;      
        uint16 finishedWith;  // 0 -- still going, 1 -- succed, 2 -- defeated, 3 -- expired
    }

    mapping(uint256 => uint16) hashToId;
    mapping(address => mapping(uint256 => bool)) isVoted;
    Proposal[4] idToProposal;

    event ProposalExpired(Proposal);
    event newProposal(Proposal);
    event didntCreateProposal(string);
    event ProposalSucced(Proposal);
    event ProposalFailed(Proposal);
    event VotedFor(Proposal, address);
    event VotedAgainst(Proposal, address);

    constructor(uint _threshold, address _votingToken){
        threshold = _threshold;
        votingToken = ERC20Votes(_votingToken);
    }

    function createProposal(uint256 _proposalHash) public {
        require(hashToId[_proposalHash] == 0, "Create: Proposal shouldn't exists");
        require(votingToken.getVotes(msg.sender) > 0, "Create: You should have voting power");

        // If more 3 proposals already in the queue, we'll try to get rid of those, who obselete(older go out first)
        bool[4] memory isFree = [false, false, false, false];
        
        // Ending Obselete Proposals
        for (uint16 i = 1; i < 4; ++i) {
            Proposal memory proposal = idToProposal[i];
            
            if (proposal.startTime > 0 && proposal.endTime < Time.blockNumber() && hashToId[proposal.phash] != INF) {
                proposal.finishedWith = 3;
                emit ProposalExpired(proposal);
            }

            if (proposal.endTime < Time.blockNumber() || hashToId[proposal.phash] == INF) {
                isFree[i] = true;
                hashToId[proposal.phash] = INF;
            }
        }

        // Moving Existing Proposals to the place were deleted were
        for (uint16 i = 1; i < 4; ++i){
            if (isFree[i] == true) { 
                delete idToProposal[i];

                uint ind = i + 1;
                while(ind < 4 && isFree[ind]) ind += 1;

                if (ind == 4) {
                    freeId = i < freeId ? i : freeId;
                    continue;
                }

                idToProposal[i] = idToProposal[ind];
                freeId = i + 1;

                isFree[i] = false;
                isFree[ind] = true;
            }
        }

        // If have free space(also after cleaning from step above), adding new proposal
        if (freeId < 4) {
            hashToId[_proposalHash] = freeId;
            idToProposal[freeId] = Proposal(_proposalHash, Time.blockNumber(), Time.blockNumber() + 3 days, 0, 0, 0);

            emit newProposal(idToProposal[freeId]);
            freeId += 1;
            return;
        }
        emit didntCreateProposal("Create: Proposal wasn't created: no free spaces for proposal");
    }

    function voteFor(uint _proposalHash) public {
        require(hashToId[_proposalHash] < 4 && hashToId[_proposalHash] >= 1, "Vote For: Proposal already expired or finshed or never existed");
        require(isVoted[msg.sender][_proposalHash] == false, "Vote For: already voted");

        uint16 id = uint16(hashToId[_proposalHash]);
        Proposal memory proposal = idToProposal[id];

        require(proposal.endTime > Time.blockNumber(), "Vote For: Proposal already expired");
        uint amount = votingToken.getPastVotes(msg.sender, proposal.startTime);
        
        proposal.amountFor += amount;
        isVoted[msg.sender][_proposalHash] = true;

        emit VotedFor(proposal, msg.sender);
        if (proposal.amountFor >= threshold) {            
            //change proposal stated to finished
            proposal.finishedWith = 1;
            hashToId[_proposalHash] = INF;
            emit ProposalSucced(proposal);
        }

        idToProposal[id] = proposal;
    }

    function voteAgainst(uint _proposalHash) public {
        require(hashToId[_proposalHash] < 4 && hashToId[_proposalHash] >= 1, "Vote Against: Proposal already expired or finshed or never existed");
        require(isVoted[msg.sender][_proposalHash] == false, "Vote Against: already voted");

        uint16 id = uint16(hashToId[_proposalHash]);
        Proposal memory proposal = idToProposal[id];

        require(proposal.endTime > Time.blockNumber(), "Vote Against: Proposal already expired");
        
        uint amount = votingToken.getPastVotes(msg.sender, proposal.startTime);
        proposal.amountAgainst += amount;
        isVoted[msg.sender][_proposalHash] = true;

        emit VotedAgainst(proposal, msg.sender);
        if (proposal.amountAgainst >= threshold) {
            //change proposal stated to finished
            proposal.finishedWith = 2;
            hashToId[_proposalHash] = INF;

            emit ProposalFailed(proposal);
        }

        idToProposal[id] = proposal;
    }

    function getActiveProposal(uint _proposalHash) external view returns(Proposal memory) {
        require(hashToId[_proposalHash] < 4 && hashToId[_proposalHash] >= 1, "Get Proposal: Proposal already expired or finshed or never existed");
        return idToProposal[hashToId[_proposalHash]];
    }

    function getListofActiveProposals() external view returns(Proposal[3] memory){
        Proposal[3] memory proposals;
        uint16 ind = 0;

        for (uint16 i = 1; i < 4; ++i) {
            Proposal memory proposal = idToProposal[i];
                
            if (proposal.endTime >= Time.blockNumber() || hashToId[proposal.phash] != INF) {
                proposals[ind] = proposal;
                ind++;
            }
        }

        return proposals;
    }
}