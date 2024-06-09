import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { Storage } from "../typechain-types/Storage";
import { expect } from "chai";

describe("Storage", function () {
    async function deployment() {
        const StorageFactory = await ethers.getContractFactory("Storage");
        const storage = await StorageFactory.deploy() as Storage; // Type assertion here
        const [owner, addr1] = await ethers.getSigners();

        return { storage, owner, addr1 };
    }

    describe("Update and Get Hash", function () {
        it("Should update the hash and emit an event", async function () {
            const { storage, owner, addr1 } = await loadFixture(deployment);
            const hash = "QmYwAPJzv5CZsnAzt8auVTLxS3W5jA3jqBf3hx3L6TDR3t";
            const hash2 = "QmPChd2hVbrJ6WBAaUJTfHNTZn8KJZHj6gk3d3xFvhH7JB"

            await storage.updateHash(hash);
            expect(await storage.userToHash(owner.address)).to.equals(hash);

            await storage.updateHash(hash2);
            expect(await storage.userToHash(owner.address)).to.equals(hash2);
        });
    });
});
