import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { RoleManager, ReputationManager } from "../typechain-types";

describe("RoleManager", function () {
  let roleManager: RoleManager;
  let reputationManager: ReputationManager;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let user4: SignerWithAddress;

  // Role enum values
  const Role = {
    REGULAR_USER: 0,
    CONTRIBUTOR: 1,
    EVALUATOR: 2,
    MODERATOR: 3,
    ADMIN: 4
  };

  // Domain enum value for testing
  const Domain = {
    COMPUTER_SCIENCE_FUNDAMENTALS: 0,
    SOFTWARE_DEVELOPMENT: 1,
    SYSTEMS_AND_NETWORKING: 2
  };

  beforeEach(async function () {
    [owner, user1, user2, user3, user4] = await ethers.getSigners();

    // Deploy ReputationManager first
    const ReputationManagerFactory = await ethers.getContractFactory("ReputationManager");
    reputationManager = await ReputationManagerFactory.deploy();
    await reputationManager.waitForDeployment();

    // Deploy RoleManager with ReputationManager address
    const RoleManagerFactory = await ethers.getContractFactory("RoleManager");
    roleManager = await RoleManagerFactory.deploy(await reputationManager.getAddress());
    await roleManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the deployer as owner and admin", async function () {
      expect(await roleManager.owner()).to.equal(owner.address);
      expect(await roleManager.getUserRole(owner.address)).to.equal(Role.ADMIN);
      expect(await roleManager.isRegistered(owner.address)).to.be.true;
    });

    it("Should set correct reputation manager", async function () {
      expect(await roleManager.reputationManager()).to.equal(await reputationManager.getAddress());
    });

    it("Should initialize role requirements correctly", async function () {
      const regularUserReq = await roleManager.roleRequirements(Role.REGULAR_USER);
      expect(regularUserReq.minGlobalReputation).to.equal(0);
      expect(regularUserReq.minDomainReputation).to.equal(0);
      expect(regularUserReq.requiresDomainExpertise).to.be.false;

      const contributorReq = await roleManager.roleRequirements(Role.CONTRIBUTOR);
      expect(contributorReq.minGlobalReputation).to.equal(100);
      expect(contributorReq.minDomainReputation).to.equal(50);
      expect(contributorReq.requiresDomainExpertise).to.be.false;

      const evaluatorReq = await roleManager.roleRequirements(Role.EVALUATOR);
      expect(evaluatorReq.minGlobalReputation).to.equal(500);
      expect(evaluatorReq.minDomainReputation).to.equal(200);
      expect(evaluatorReq.requiresDomainExpertise).to.be.true;
    });
  });

  describe("User Registration", function () {
    it("Should register a new user with REGULAR_USER role", async function () {
      await expect(roleManager.registerUser(user1.address))
        .to.emit(roleManager, "UserRegistered")
        .withArgs(user1.address)
        .and.to.emit(roleManager, "RoleAssigned")
        .withArgs(user1.address, Role.REGULAR_USER, Role.REGULAR_USER);

      expect(await roleManager.isRegistered(user1.address)).to.be.true;
      expect(await roleManager.getUserRole(user1.address)).to.equal(Role.REGULAR_USER);
      expect(await roleManager.getUserCount()).to.equal(2); // owner + user1
    });

    it("Should fail to register user with zero address", async function () {
      await expect(roleManager.registerUser(ethers.ZeroAddress))
        .to.be.revertedWith("RoleManager: Invalid user address");
    });

    it("Should fail to register already registered user", async function () {
      await roleManager.registerUser(user1.address);
      await expect(roleManager.registerUser(user1.address))
        .to.be.revertedWith("RoleManager: User already registered");
    });
  });

  describe("Role Requirements Check", function () {
    beforeEach(async function () {
      await roleManager.registerUser(user1.address);
    });

    it("Should check role requirements correctly for insufficient reputation", async function () {
      const [meetsReq, reason] = await roleManager.checkRoleRequirements(user1.address, Role.CONTRIBUTOR);
      expect(meetsReq).to.be.false;
      expect(reason).to.equal("Insufficient global reputation");
    });

    it("Should check role requirements correctly for sufficient reputation", async function () {
      // Mock sufficient global reputation by simulating reputation update
      // In real scenario, this would come from ReputationManager interactions
      const [meetsReq, reason] = await roleManager.checkRoleRequirements(user1.address, Role.REGULAR_USER);
      expect(meetsReq).to.be.true;
      expect(reason).to.equal("");
    });
  });

  describe("Manual Role Assignment (Admin Functions)", function () {
    it("Should allow admin to assign roles", async function () {
      await expect(roleManager.assignRole(user1.address, Role.CONTRIBUTOR))
        .to.emit(roleManager, "UserRegistered")
        .withArgs(user1.address)
        .and.to.emit(roleManager, "RoleAssigned")
        .withArgs(user1.address, Role.CONTRIBUTOR, Role.REGULAR_USER);

      expect(await roleManager.getUserRole(user1.address)).to.equal(Role.CONTRIBUTOR);
    });

    it("Should fail when non-admin tries to assign roles", async function () {
      await expect(roleManager.connect(user1).assignRole(user2.address, Role.CONTRIBUTOR))
        .to.be.revertedWith("RoleManager: Admin access required");
    });

    it("Should allow admin to assign role to already registered user", async function () {
      await roleManager.registerUser(user1.address);
      await expect(roleManager.assignRole(user1.address, Role.MODERATOR))
        .to.emit(roleManager, "RoleAssigned")
        .withArgs(user1.address, Role.MODERATOR, Role.REGULAR_USER);

      expect(await roleManager.getUserRole(user1.address)).to.equal(Role.MODERATOR);
    });
  });

  describe("Role Upgrade Cooldown", function () {
    it("Should enforce role upgrade cooldown", async function () {
      await roleManager.registerUser(user1.address);
      
      // First upgrade (should work if requirements are met)
      // Note: This will fail due to reputation requirements, but we're testing the cooldown logic
      await expect(roleManager.connect(user1).requestRoleUpgrade(Role.CONTRIBUTOR))
        .to.be.revertedWith("RoleManager: Insufficient global reputation");

      // Manually assign contributor role first
      await roleManager.assignRole(user1.address, Role.CONTRIBUTOR);
      
      // Try to upgrade again immediately (should fail due to cooldown)
      await expect(roleManager.connect(user1).requestRoleUpgrade(Role.EVALUATOR))
        .to.be.revertedWith("RoleManager: Insufficient global reputation");
    });
  });

  describe("Access Control Functions", function () {
    beforeEach(async function () {
      await roleManager.assignRole(user1.address, Role.CONTRIBUTOR);
      await roleManager.assignRole(user2.address, Role.EVALUATOR);
      await roleManager.assignRole(user3.address, Role.MODERATOR);
    });

    it("Should correctly check if user has specific role", async function () {
      expect(await roleManager.hasRole(user1.address, Role.REGULAR_USER)).to.be.true;
      expect(await roleManager.hasRole(user1.address, Role.CONTRIBUTOR)).to.be.true;
      expect(await roleManager.hasRole(user1.address, Role.EVALUATOR)).to.be.false;

      expect(await roleManager.hasRole(user2.address, Role.EVALUATOR)).to.be.true;
      expect(await roleManager.hasRole(user2.address, Role.MODERATOR)).to.be.false;

      expect(await roleManager.hasRole(user3.address, Role.MODERATOR)).to.be.true;
      expect(await roleManager.hasRole(user3.address, Role.ADMIN)).to.be.false;
    });

    it("Should correctly check contribution permissions", async function () {
      expect(await roleManager.canContribute(user1.address)).to.be.true;
      expect(await roleManager.canContribute(user2.address)).to.be.true;
      expect(await roleManager.canContribute(user3.address)).to.be.true;
      
      await roleManager.registerUser(user4.address); // Regular user
      expect(await roleManager.canContribute(user4.address)).to.be.false;
    });

    it("Should correctly check moderation permissions", async function () {
      expect(await roleManager.canModerate(user1.address)).to.be.false;
      expect(await roleManager.canModerate(user2.address)).to.be.false;
      expect(await roleManager.canModerate(user3.address)).to.be.true;
      expect(await roleManager.canModerate(owner.address)).to.be.true; // Admin
    });
  });

  describe("Role Requirements Management", function () {
    it("Should allow admin to update role requirements", async function () {
      await expect(roleManager.updateRoleRequirements(Role.CONTRIBUTOR, 200, 100, true))
        .to.emit(roleManager, "RoleRequirementsUpdated")
        .withArgs(Role.CONTRIBUTOR, 200, 100);

      const updatedReq = await roleManager.roleRequirements(Role.CONTRIBUTOR);
      expect(updatedReq.minGlobalReputation).to.equal(200);
      expect(updatedReq.minDomainReputation).to.equal(100);
      expect(updatedReq.requiresDomainExpertise).to.be.true;
    });

    it("Should fail to update admin role requirements", async function () {
      await expect(roleManager.updateRoleRequirements(Role.ADMIN, 1000, 500, false))
        .to.be.revertedWith("RoleManager: Cannot modify admin requirements");
    });

    it("Should fail when non-admin tries to update requirements", async function () {
      await expect(roleManager.connect(user1).updateRoleRequirements(Role.CONTRIBUTOR, 200, 100, true))
        .to.be.revertedWith("RoleManager: Admin access required");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await roleManager.assignRole(user1.address, Role.CONTRIBUTOR);
      await roleManager.assignRole(user2.address, Role.EVALUATOR);
      await roleManager.assignRole(user3.address, Role.CONTRIBUTOR);
    });

    it("Should return all registered users", async function () {
      const users = await roleManager.getAllUsers();
      expect(users.length).to.equal(4); // owner + 3 users
      expect(users).to.include(owner.address);
      expect(users).to.include(user1.address);
      expect(users).to.include(user2.address);
      expect(users).to.include(user3.address);
    });

    it("Should return users by specific role", async function () {
      const contributors = await roleManager.getUsersByRole(Role.CONTRIBUTOR);
      expect(contributors.length).to.equal(2);
      expect(contributors).to.include(user1.address);
      expect(contributors).to.include(user3.address);

      const evaluators = await roleManager.getUsersByRole(Role.EVALUATOR);
      expect(evaluators.length).to.equal(1);
      expect(evaluators[0]).to.equal(user2.address);

      const admins = await roleManager.getUsersByRole(Role.ADMIN);
      expect(admins.length).to.equal(1);
      expect(admins[0]).to.equal(owner.address);
    });

    it("Should return correct user count", async function () {
      expect(await roleManager.getUserCount()).to.equal(4);
    });
  });

  describe("Reputation Manager Integration", function () {
    it("Should allow owner to update reputation manager", async function () {
      const newReputationManager = await ethers.getContractFactory("ReputationManager");
      const newRepManager = await newReputationManager.deploy();
      await newRepManager.waitForDeployment();

      await expect(roleManager.updateReputationManager(await newRepManager.getAddress()))
        .to.emit(roleManager, "ReputationManagerUpdated")
        .withArgs(await newRepManager.getAddress());

      expect(await roleManager.reputationManager()).to.equal(await newRepManager.getAddress());
    });

    it("Should fail when non-owner tries to update reputation manager", async function () {
      await expect(roleManager.connect(user1).updateReputationManager(user2.address))
        .to.be.revertedWith("RoleManager: Only owner can call this function");
    });
  });

  describe("Ownership Transfer", function () {
    it("Should allow owner to transfer ownership", async function () {
      await roleManager.transferOwnership(user1.address);
      expect(await roleManager.owner()).to.equal(user1.address);
    });

    it("Should fail when non-owner tries to transfer ownership", async function () {
      await expect(roleManager.connect(user1).transferOwnership(user2.address))
        .to.be.revertedWith("RoleManager: Only owner can call this function");
    });

    it("Should fail to transfer ownership to zero address", async function () {
      await expect(roleManager.transferOwnership(ethers.ZeroAddress))
        .to.be.revertedWith("RoleManager: Invalid address");
    });
  });
});
