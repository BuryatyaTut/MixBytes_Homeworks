import { loadFixture, mine, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { expect } from "chai";
import { AddressLike } from "ethers";
import { ItmoVotingToken, Voting } from "../typechain-types";

describe("Voting", function () {
    const _hash = 1;
    const decimals = 10**6;
    const three_days = 3 * 24 * 60 * 60;

    function findEventArgs(logs, eventName: String) {
        let _event = null;

        for (const event of logs) {
            if (event.fragment && event.fragment.name === eventName) {
                _event = event.args[0];
            }
        }

        return _event;
    }

    async function initVotes(votingToken: ItmoVotingToken, owner: AddressLike, addr1: AddressLike, addr2: AddressLike, _hash: number) {
        await votingToken.delegate(owner);
        await votingToken.transfer(addr1, 40 * decimals);
        await votingToken.transfer(addr2, 35 * decimals);

        await votingToken.connect(addr1).delegate(addr1);
        await votingToken.connect(addr2).delegate(addr2);
    }

    async function deployAndSigners() {
        const [owner, addr1, addr2] = await hre.ethers.getSigners();

        const VotingToken = await hre.ethers.getContractFactory("ItmoVotingToken");
        const votingToken = await VotingToken.deploy();
        const votingTokenAddress = await votingToken.getAddress();
        // console.log("Address of Voting Token is %s", votingTokenAddress);

        const threshold = 50 * decimals;
        const Voting = await hre.ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(threshold, votingTokenAddress);

        return { voting, votingToken, owner, addr1, addr2 };
    }

    describe("Basics", async function () {
        it("Checking Work of VotingToken", async function () {
            const { voting, votingToken, owner, addr1 } = await loadFixture(deployAndSigners);

            expect(await votingToken.balanceOf(owner)).to.equal(await votingToken.totalSupply());
            expect(await votingToken.getVotes(owner)).to.equal(0);

            await votingToken.delegate(owner);
            const startTime = await hre.ethers.provider.getBlockNumber();
            expect(await votingToken.getVotes(owner)).to.equal(await votingToken.balanceOf(owner));

            const amount = 50 * decimals;
            await votingToken.transfer(addr1, amount);
            expect(await votingToken.getVotes(owner)).to.equal(amount);
            expect(await votingToken.getPastVotes(owner, startTime)).to.equal(await votingToken.totalSupply()); // to equal 100

            expect(await votingToken.getVotes(addr1)).to.equal(0); // addr1 votes power is 0
            expect(await votingToken.balanceOf(addr1)).to.equal(amount); // addr1 balance is 50
            await votingToken.connect(addr1).delegate(addr1);
            const secondTime = await hre.ethers.provider.getBlockNumber();

            expect(await votingToken.getVotes(addr1)).to.equal(amount); // addt1 votes power is 50
            await votingToken.connect(addr1).delegate(owner);
            expect(await votingToken.getVotes(addr1)).to.equal(0);
            expect(await votingToken.getPastVotes(addr1, secondTime)).to.equal(amount);
            expect(await votingToken.getVotes(owner)).to.equal(amount * 2);
            expect(await votingToken.balanceOf(addr1)).to.equal(amount); // addr1 balance is 50

            // console.log(await votingToken.numCheckpoints(owner));
        });

        it("One Proposal WorkFlow -- Win", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            await expect(voting.createProposal(_hash)).to.be.revertedWith("Create: You should have voting power");
            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);
            const startTime = await hre.ethers.provider.getBlockNumber();
            const endTime = await startTime + 3 * 24 * 60 * 60;
            const proposal = await voting.getActiveProposal(_hash);
            // console.log("proposal after creation", proposal);
            expect(startTime).to.eq(proposal[1]);
            expect(endTime).to.eq(proposal[2]);
            expect(proposal[3]).to.eq(0);

            await voting.connect(owner).voteFor(_hash);
            const proposalFor = await voting.getActiveProposal(_hash);
            // console.log("proposal after first vote for", proposalFor);
            expect(proposalFor[3]).to.eq(await votingToken.getVotes(owner));
            expect(proposalFor[5]).to.eq(0);

            await voting.connect(addr2).voteAgainst(_hash);
            const proposalAgainst = await voting.getActiveProposal(_hash);
            // console.log(proposalAgainst);
            expect(proposalAgainst[4]).to.eq(await votingToken.getVotes(addr2));
            expect(proposalAgainst[5]).to.eq(0);

            const proposals = await voting.getListofActiveProposals();
            // console.log(proposals);

            let tx = await voting.connect(addr1).voteFor(_hash);
            let receipt = await tx.wait();

            //Expecting to have this event, otherwise test will fail
            const proposalFinal = findEventArgs(receipt?.logs, "ProposalSucced");
            // console.log(proposalFinal);
            expect(proposalFinal[3]).to.eq(await votingToken.getVotes(addr1) + await votingToken.getVotes(owner));
            expect(proposalFinal[5]).to.eq(1);

            const proposals2 = await voting.getListofActiveProposals();
            // console.log(proposals2);
        });

        it("One Proposal WorkFlow -- Loss", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            await expect(voting.createProposal(_hash)).to.be.revertedWith("Create: You should have voting power");
            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);
            const startTime = await hre.ethers.provider.getBlockNumber();
            const endTime = await startTime + 3 * 24 * 60 * 60;
            const proposal = await voting.getActiveProposal(_hash);
            // console.log("proposal after creation", proposal);
            expect(startTime).to.eq(proposal[1]);
            expect(endTime).to.eq(proposal[2]);
            expect(proposal[3]).to.eq(0);

            await voting.connect(owner).voteAgainst(_hash);
            const proposalAgainst = await voting.getActiveProposal(_hash);
            // console.log("proposal after first vote for", proposalFor);
            expect(proposalAgainst[4]).to.eq(await votingToken.getVotes(owner));
            expect(proposalAgainst[5]).to.eq(0);

            await voting.connect(addr2).voteFor(_hash);
            const proposalFor = await voting.getActiveProposal(_hash);
            // console.log(proposalAgainst);
            expect(proposalFor[3]).to.eq(await votingToken.getVotes(addr2));
            expect(proposalFor[5]).to.eq(0);

            const proposals = await voting.getListofActiveProposals();
            // console.log(proposals);

            // console.log('-------------------------');
            let tx = await voting.connect(addr1).voteAgainst(_hash);
            let receipt = await tx.wait();

            const proposalFinal = findEventArgs(receipt?.logs, "ProposalFailed");
            // console.log(proposalFinal);
            expect(proposalFinal[4]).to.eq(await votingToken.getVotes(addr1) + await votingToken.getVotes(owner));
            expect(proposalFinal[5]).to.eq(2);
            // console.log('-------------------------');

            const proposals2 = await voting.getListofActiveProposals();
            // console.log(proposals2);
        });

        it("One Proposal WorkFlow -- Discarded", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            await expect(voting.createProposal(_hash)).to.be.revertedWith("Create: You should have voting power");
            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);
            const startTime = await hre.ethers.provider.getBlockNumber();
            const endTime = await startTime + three_days;
            const proposal = await voting.getActiveProposal(_hash);
            // console.log("proposal after creation", proposal);
            expect(startTime).to.eq(proposal[1]);
            expect(endTime).to.eq(proposal[2]);
            expect(proposal[3]).to.eq(0);

            await mine(three_days + 1);

            let tx = await voting.createProposal(2);
            let receipt = await tx.wait();
            const proposalFinal = findEventArgs(receipt?.logs, "ProposalExpired");
            // console.log(proposalFinal);
            expect(proposalFinal[5]).to.eq(3);
            // console.log(await hre.ethers.provider.getBlockNumber());
        });
    });

    describe("Create Proposal Function", async function () {
        it("Without Voting Power", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            await expect(voting.createProposal(_hash)).to.revertedWith("Create: You should have voting power");
        });

        it("Proposal Already Exists", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);
            await expect(voting.createProposal(_hash)).to.revertedWith("Create: Proposal shouldn't exists");
        });

        it("Create Proposal - Expire - Try to create the same - Revert", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            const three_days = 3 * 24 * 60 * 60;
            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);
            await mine(three_days + 100);
            await expect(voting.createProposal(_hash)).to.revertedWith("Create: Proposal shouldn't exists");
        });

        it("Create Proposal - It Wins - Try to create the same - Revert", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            const three_days = 3 * 24 * 60 * 60;
            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);

            await voting.voteFor(_hash);
            await voting.connect(addr1).voteFor(_hash);

            await expect(voting.createProposal(_hash)).to.revertedWith("Create: Proposal shouldn't exists");
        });

        it("Create Proposal - It Loses - Try to create the same - Revert", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            const three_days = 3 * 24 * 60 * 60;
            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);

            await voting.voteAgainst(_hash);
            await voting.connect(addr1).voteAgainst(_hash);

            await expect(voting.createProposal(_hash)).to.revertedWith("Create: Proposal shouldn't exists");
        });


        it("Create 3 Proposals - Try to create the 4th - Decline", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            const three_days = 3 * 24 * 60 * 60;
            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);
            await voting.createProposal(_hash + 1);
            await voting.createProposal(_hash + 2);

            await expect(voting.createProposal(_hash + 3)).to.emit(voting, "didntCreateProposal");
        });

        it("Create 3 Proposals - 2nd ends - Try to create the 4th - Success", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);
            await voting.createProposal(_hash + 1);
            await voting.createProposal(_hash + 2);

            await voting.voteAgainst(_hash + 1);
            await voting.connect(addr1).voteAgainst(_hash + 1);

            await expect(voting.createProposal(_hash + 3)).to.emit(voting, "newProposal");
            await expect(voting.createProposal(_hash + 4)).to.emit(voting, "didntCreateProposal");
        });

        it("Create 3 Proposals - 1st expires - Try to create the 4th - Success", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);
            await mine(three_days / 3);
            await voting.createProposal(_hash + 1);
            await mine(three_days / 3);
            await voting.createProposal(_hash + 2);

            await mine(three_days / 3);

            await expect(voting.createProposal(_hash + 3)).to.emit(voting, "newProposal");
            await expect(voting.createProposal(_hash + 4)).to.emit(voting, "didntCreateProposal");
        });

        it("Create 3 Proposals - All expires - Try to create the 4th - Success (and only 1 prop left)", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);
            await voting.createProposal(_hash + 1);
            await voting.createProposal(_hash + 2);

            await mine(three_days + 1000);

            await expect(voting.createProposal(_hash + 3)).to.emit(voting, "newProposal");
            const proposals = await voting.getListofActiveProposals();
            expect(proposals[0][0]).to.eq(4);
            expect(proposals[1][0]).to.eq(0);
            expect(proposals[2][0]).to.eq(0);
        });

        it("Create 3 Proposals - 2nd Ends - Try to Create the 4th - Success (and it's on the 3rd place)", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);
            await voting.createProposal(_hash + 1);
            await voting.createProposal(_hash + 2);

            await voting.voteAgainst(_hash + 1);
            await voting.connect(addr1).voteAgainst(_hash + 1);

            await expect(voting.createProposal(_hash + 3)).to.emit(voting, "newProposal");
            const proposals = await voting.getListofActiveProposals();
            expect(proposals[0][0]).to.eq(1);
            expect(proposals[1][0]).to.eq(3);
            expect(proposals[2][0]).to.eq(4);
        });

        it("Create 3 Proposals - 1st & 2nd Ends - Try to Create the 4th - Success (and it's on the 2nd place)", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);
            await voting.createProposal(_hash + 1);
            await voting.createProposal(_hash + 2);

            await voting.voteFor(_hash + 1);
            await voting.connect(addr1).voteFor(_hash + 1);

            await voting.voteFor(_hash);
            await voting.connect(addr1).voteFor(_hash);

            await expect(voting.createProposal(_hash + 3)).to.emit(voting, "newProposal");
            const proposals = await voting.getListofActiveProposals();
            expect(proposals[0][0]).to.eq(3);
            expect(proposals[1][0]).to.eq(4);
            expect(proposals[2][0]).to.eq(0);
        });

        it("Create 3 Proposals - 1st & 3rd Ends - Try to Create the 4th - Success (and it's on the 2nd place)", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);

            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);
            await voting.createProposal(_hash + 1);
            await voting.createProposal(_hash + 2);

            await voting.voteFor(_hash + 2);
            await voting.connect(addr1).voteFor(_hash + 2);

            await voting.voteFor(_hash);
            await voting.connect(addr1).voteFor(_hash);

            await expect(voting.createProposal(_hash + 3)).to.emit(voting, "newProposal");
            const proposals = await voting.getListofActiveProposals();
            expect(proposals[0][0]).to.eq(2);
            expect(proposals[1][0]).to.eq(4);
            expect(proposals[2][0]).to.eq(0);
        });
    });

    describe("VoteFor Function", async function () {
        it("Vote For Proposal Which Doesn't Exists", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await expect(voting.voteFor(_hash)).to.be.revertedWith("Vote For: Proposal already expired or finshed or never existed");
        });

        it("Vote For Proposal Twice", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);
            
            await voting.createProposal(_hash);

            await voting.voteFor(_hash);
            await expect(voting.voteFor(_hash)).to.be.revertedWith("Vote For: already voted");
        });

        it("Vote For Proposal (Expired)", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);
            
            await voting.createProposal(_hash);
            await mine(three_days);

            await expect(voting.voteFor(_hash)).to.be.revertedWith("Vote For: Proposal already expired");
        });

        it("Vote For Ended Proposal (Succed)", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);
            
            await voting.createProposal(_hash);

            await voting.voteFor(_hash);
            await voting.connect(addr1).voteFor(_hash);
            await expect(voting.connect(addr2).voteFor(_hash)).to.be.revertedWith("Vote For: Proposal already expired or finshed or never existed");
        });

        it("Vote For Ended Proposal (Defeated)", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);
            
            await voting.createProposal(_hash);

            await voting.voteAgainst(_hash);
            await voting.connect(addr1).voteAgainst(_hash);
            await expect(voting.connect(addr2).voteFor(_hash)).to.be.revertedWith("Vote For: Proposal already expired or finshed or never existed");
        });


        it("Vote For Proposal -- All Good", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);
            
            await voting.createProposal(_hash);
            await mine(three_days / 10);

            await voting.voteFor(_hash);
            const proposal = await voting.getActiveProposal(_hash);
            expect(proposal[3]).to.eq(await votingToken.getPastVotes(owner, proposal[1]));
        });
    });

    describe("VoteAgainst Function", async function () {
        it("Vote Against Proposal Which Doesn't Exists", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await expect(voting.voteAgainst(_hash)).to.be.revertedWith("Vote Against: Proposal already expired or finshed or never existed");
        });

        it("Vote Against Proposal Twice", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);
            
            await voting.createProposal(_hash);

            await voting.voteAgainst(_hash);
            await expect(voting.voteAgainst(_hash)).to.be.revertedWith("Vote Against: already voted");
        });

        it("Vote Against Proposal (Expired)", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);
            
            await voting.createProposal(_hash);
            await mine(three_days);

            await expect(voting.voteAgainst(_hash)).to.be.revertedWith("Vote Against: Proposal already expired");
        });

        it("Vote Against Ended Proposal (Succed)", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);
            
            await voting.createProposal(_hash);

            await voting.voteFor(_hash);
            await voting.connect(addr1).voteFor(_hash);
            await expect(voting.connect(addr2).voteAgainst(_hash)).to.be.revertedWith("Vote Against: Proposal already expired or finshed or never existed");
        });

        it("Vote Against Ended Proposal (Defeated)", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);
            
            await voting.createProposal(_hash);

            await voting.voteAgainst(_hash);
            await voting.connect(addr1).voteAgainst(_hash);
            await expect(voting.connect(addr2).voteAgainst(_hash)).to.be.revertedWith("Vote Against: Proposal already expired or finshed or never existed");
        });


        it("Vote Against Proposal -- All Good", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);
            
            await voting.createProposal(_hash);
            await mine(three_days / 10);

            await voting.voteAgainst(_hash);
            const proposal = await voting.getActiveProposal(_hash);
            expect(proposal[4]).to.eq(await votingToken.getPastVotes(owner, proposal[1]));
        });
    });

    describe("Combination of Voting Functions", async function() {
        it("Voting For and then Against at the Same Proposal", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);

            await voting.voteFor(_hash);
            await expect(voting.voteAgainst(_hash)).to.revertedWith("Vote Against: already voted");
        });

        it("Voting Against and then For at the Same Proposal", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            await initVotes(votingToken, owner, addr1, addr2, _hash);

            await voting.createProposal(_hash);

            await voting.voteAgainst(_hash);
            await expect(voting.voteFor(_hash)).to.revertedWith("Vote For: already voted");
        });

        it("Voting For - Transfer - Vote From Another Account - Not Counting These ", async function () {
            const { voting, votingToken, owner, addr1, addr2 } = await loadFixture(deployAndSigners);
            const initBalance = 10 * decimals;
            await votingToken.transfer(addr1, initBalance);
            await votingToken.connect(addr1).delegate(addr1);
            
            await voting.connect(addr1).createProposal(_hash);
            await voting.connect(addr1).voteFor(_hash);
            expect((await voting.getActiveProposal(_hash))[3]).to.eq(initBalance);

            await votingToken.connect(addr1).transfer(addr2, initBalance);
            await votingToken.connect(addr2).delegate(addr2);

            await voting.connect(addr2).voteFor(_hash);
            expect((await voting.getActiveProposal(_hash))[3]).to.eq(initBalance);
        });
    });
});