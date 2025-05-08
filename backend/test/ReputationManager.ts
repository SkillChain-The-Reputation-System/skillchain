import { expect } from "chai";
import hre from "hardhat";

describe("ReputationManager - Initial State", () => {
  let publicClient: any;
  let ownerClient: any, client1: any, client2: any;
  let ownerAddress: string, client1Address: string, client2Address: string;
  let contract: any;
  let publicContract: any;

  beforeEach(async () => {
    // setup clients
    publicClient = await hre.viem.getPublicClient();
    [ownerClient, client1, client2] = await hre.viem.getWalletClients();
    ownerAddress = ownerClient.account.address;
    client1Address = client1.account.address;
    client2Address = client2.account.address;

    // inside beforeEach
    const mathUtils = await hre.viem.deployContract(
      "MathUtils", // library name (fully-qualified)
      [], // no constructor args
      { client: { wallet: ownerClient } }
    );

    const weights = await hre.viem.deployContract("Weights", [], {
      client: { wallet: ownerClient },
    });

    // deploy ReputationManager
    contract = await hre.viem.deployContract("ReputationManager", [], {
      client: { wallet: ownerClient },
      libraries: {
        "contracts/Constants.sol:MathUtils": mathUtils.address,
        "contracts/Constants.sol:Weights": weights.address,
      },
    });

    publicContract = await hre.viem.getContractAt(
      "ReputationManager",
      contract.address,
      { client: { wallet: publicClient } }
    );
  });


  it("should have zero domain and global reputation for any account and domain by default", async () => {
    const accounts = [ownerAddress, client1Address, client2Address];
    const numDomains = 14; // as defined in SystemEnums.Domain

    for (const addr of accounts) {
      // check global reputation
      const globalRep = await publicContract.read.global_reputation([addr]);
      expect(globalRep).to.equal(BigInt(0));

      // check each domain reputation
      for (let domain = 0; domain < numDomains; domain++) {
        const domainRep = await publicContract.read.domain_reputation([
          addr,
          domain,
        ]);
        expect(domainRep).to.equal(BigInt(0));
      }
    }
  });
  it("should revert with Invalid threshold value for updateSolvingProblemReputation when threshold is invalid", async () => {
    const invalidThresholds = [BigInt(0), BigInt(100)]; // BASE_WEIGHT = 100
    for (const threshold of invalidThresholds) {
      try {
        await contract.write.updateSolvingProblemReputation([
          ownerAddress,
          0, // domain
          50, // final_score
          threshold,
          10, // scaling constant
          0, // difficulty
        ]);
        throw new Error(
          `Expected revert for threshold ${threshold.toString()}`
        );
      } catch (err: any) {
        expect(err.message).to.contain("Invalid threshold value");
      }
    }
  });
  it("should revert with Invalid threshold value for all update functions when threshold is invalid", async () => {
    const invalidThresholds = [BigInt(0), BigInt(100)]; // BASE_WEIGHT = 100

    for (const threshold of invalidThresholds) {
      // updateSolvingProblemReputation
      try {
        await contract.write.updateSolvingProblemReputation([
          ownerAddress,
          0,
          50,
          threshold,
          10,
          0,
        ]);
        throw new Error("Expected revert for updateSolvingProblemReputation");
      } catch (err: any) {
        expect(err.message).to.contain("Invalid threshold value");
      }

      // updateEvaluateSolutionReputation
      try {
        await contract.write.updateEvaluateSolutionReputation([
          ownerAddress,
          0,
          50,
          40,
          threshold,
          10,
        ]);
        throw new Error("Expected revert for updateEvaluateSolutionReputation");
      } catch (err: any) {
        expect(err.message).to.contain("Invalid threshold value");
      }

      // updateContributionReputation
      try {
        await contract.write.updateContributionReputation([
          ownerAddress,
          0,
          50,
          threshold,
          10,
          0,
        ]);
        throw new Error("Expected revert for updateContributionReputation");
      } catch (err: any) {
        expect(err.message).to.contain("Invalid threshold value");
      }

      // updateModerationReputation
      try {
        await contract.write.updateModerationReputation([
          ownerAddress,
          0,
          50,
          40,
          threshold,
          10,
        ]);
        throw new Error("Expected revert for updateModerationReputation");
      } catch (err: any) {
        expect(err.message).to.contain("Invalid threshold value");
      }
    }
  });

  it("Solving-problem: score < threshold → negative delta", async () => {
    const domain = 0;
    const threshold = BigInt(50);
    const finalScore = BigInt(30);
    const scalingConstant = BigInt(10);
    const difficulty = 0; // EASY

    const oldDomain = await publicContract.read.domain_reputation([
      ownerAddress,
      domain,
    ]);
    const oldGlobal = await publicContract.read.global_reputation([
      ownerAddress,
    ]);

    const tx = await contract.write.updateSolvingProblemReputation([
      ownerAddress,
      domain,
      finalScore,
      threshold,
      scalingConstant,
      difficulty,
    ]);

    const newDomain = await publicContract.read.domain_reputation([
      ownerAddress,
      domain,
    ]);
    const newGlobal = await publicContract.read.global_reputation([
      ownerAddress,
    ]);

    const expectedDelta = BigInt(-4);

    expect(newDomain).to.equal(oldDomain + expectedDelta);
    expect(newGlobal).to.equal(oldGlobal + expectedDelta);
  });
  it("Solving-problem: score > threshold → positive delta", async () => {
    const domain = 0;
    const threshold = BigInt(80);
    const finalScore = BigInt(95);
    const scalingConstant = BigInt(10);
    const difficulty = 0; // EASY

    const oldDomain = await publicContract.read.domain_reputation([
      ownerAddress,
      domain,
    ]);
    const oldGlobal = await publicContract.read.global_reputation([
      ownerAddress,
    ]);

    const tx = await contract.write.updateSolvingProblemReputation([
      ownerAddress,
      domain,
      finalScore,
      threshold,
      scalingConstant,
      difficulty,
    ]);

    const newDomain = await publicContract.read.domain_reputation([
      ownerAddress,
      domain,
    ]);
    const newGlobal = await publicContract.read.global_reputation([
      ownerAddress,
    ]);

    const expectedDelta = BigInt(7);

    expect(newDomain).to.equal(oldDomain + expectedDelta);
    expect(newGlobal).to.equal(oldGlobal + expectedDelta);
  });
  it("Solving-problem: score > threshold → positive delta", async () => {
    const domain = 0;
    const threshold = BigInt(80);
    const finalScore = BigInt(95);
    const scalingConstant = BigInt(10);
    const difficulty = 0; // EASY

    const oldDomain = await publicContract.read.domain_reputation([
      ownerAddress,
      domain,
    ]);
    const oldGlobal = await publicContract.read.global_reputation([
      ownerAddress,
    ]);

    const tx = await contract.write.updateSolvingProblemReputation([
      ownerAddress,
      domain,
      finalScore,
      threshold,
      scalingConstant,
      difficulty,
    ]);

    const newDomain = await publicContract.read.domain_reputation([
      ownerAddress,
      domain,
    ]);
    const newGlobal = await publicContract.read.global_reputation([
      ownerAddress,
    ]);

    const expectedDelta = BigInt(7);

    expect(newDomain).to.equal(oldDomain + expectedDelta);
    expect(newGlobal).to.equal(oldGlobal + expectedDelta);
  });

  it("Evaluate-solution: small deviation (< threshold) → positive delta", async () => {
    const domain = 0;
    const finalScore = BigInt(90);
    const evaluateScore = BigInt(85);
    const threshold = BigInt(10);
    const scalingConstant = BigInt(10);

    const oldDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const oldGlobal = await publicContract.read.global_reputation([ownerAddress]);

    await contract.write.updateEvaluateSolutionReputation([ownerAddress, domain, finalScore, evaluateScore, threshold, scalingConstant]);

    const newDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const newGlobal = await publicContract.read.global_reputation([ownerAddress]);

    const expectedDelta = BigInt(5);

    expect(newDomain).to.equal(oldDomain + expectedDelta);
    expect(newGlobal).to.equal(oldGlobal + expectedDelta);
  });
  it("Evaluate-solution: deviation = threshold → no change", async () => {
    const domain = 0;
    const finalScore = BigInt(90);
    const evaluateScore = BigInt(80);
    const threshold = BigInt(10);
    const scalingConstant = BigInt(10);

    const oldDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const oldGlobal = await publicContract.read.global_reputation([ownerAddress]);

    await contract.write.updateEvaluateSolutionReputation([ownerAddress, domain, finalScore, evaluateScore, threshold, scalingConstant]);

    const newDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const newGlobal = await publicContract.read.global_reputation([ownerAddress]);

    const expectedDelta = BigInt(0);

    expect(newDomain).to.equal(oldDomain + expectedDelta);
    expect(newGlobal).to.equal(oldGlobal + expectedDelta);
  });
  it("Evaluate-solution: large deviation (> threshold) → negative delta", async () => {
    const domain = 0;
    const finalScore = BigInt(50);
    const evaluateScore = BigInt(80);
    const threshold = BigInt(10);
    const scalingConstant = BigInt(10);

    const oldDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const oldGlobal = await publicContract.read.global_reputation([ownerAddress]);

    await contract.write.updateEvaluateSolutionReputation([ownerAddress, domain, finalScore, evaluateScore, threshold, scalingConstant]);

    const newDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const newGlobal = await publicContract.read.global_reputation([ownerAddress]);

    const expectedDelta = BigInt(-2);
    expect(newDomain).to.equal(oldDomain + expectedDelta);
    expect(newGlobal).to.equal(oldGlobal + expectedDelta);
  });

  it("Contribution: quality score < threshold → negative delta", async () => {
    const domain = 0;
    const qualityScore = BigInt(30);
    const threshold = BigInt(50);
    const scalingConstant = BigInt(10);
    const difficulty = 0; // EASY

    const oldDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const oldGlobal = await publicContract.read.global_reputation([ownerAddress]);

    await contract.write.updateContributionReputation([ownerAddress, domain, qualityScore, threshold, scalingConstant, difficulty]);

    const newDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const newGlobal = await publicContract.read.global_reputation([ownerAddress]);

    const expectedDelta = BigInt(-4);
    expect(newDomain).to.equal(oldDomain + expectedDelta);
    expect(newGlobal).to.equal(oldGlobal + expectedDelta);
  });
  it("Contribution: quality score = threshold → no change", async () => {
    const domain = 0;
    const qualityScore = BigInt(80);
    const threshold = BigInt(80);
    const scalingConstant = BigInt(10);
    const difficulty = 0; // EASY

    const oldDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const oldGlobal = await publicContract.read.global_reputation([ownerAddress]);

    await contract.write.updateContributionReputation([ownerAddress, domain, qualityScore, threshold, scalingConstant, difficulty]);

    const newDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const newGlobal = await publicContract.read.global_reputation([ownerAddress]);

    const expectedDelta = BigInt(0);
    expect(newDomain).to.equal(oldDomain + expectedDelta);
    expect(newGlobal).to.equal(oldGlobal + expectedDelta);
  });
  it("Contribution: quality score > threshold → positive delta", async () => {
    const domain = 0;
    const qualityScore = BigInt(95);
    const threshold = BigInt(80);
    const scalingConstant = BigInt(10);
    const difficulty = 0; // EASY

    const oldDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const oldGlobal = await publicContract.read.global_reputation([ownerAddress]);

    await contract.write.updateContributionReputation([ownerAddress, domain, qualityScore, threshold, scalingConstant, difficulty]);

    const newDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const newGlobal = await publicContract.read.global_reputation([ownerAddress]);

    const expectedDelta = BigInt(7);
    expect(newDomain).to.equal(oldDomain + expectedDelta);
    expect(newGlobal).to.equal(oldGlobal + expectedDelta);
  });

  it("Moderation: small deviation (< threshold) → positive delta", async () => {
    const domain = 0;
    const qualityScore = BigInt(90);
    const reviewScore = BigInt(85);
    const threshold = BigInt(10);
    const scalingConstant = BigInt(10);

    const oldDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const oldGlobal = await publicContract.read.global_reputation([ownerAddress]);

    await contract.write.updateModerationReputation([ownerAddress, domain, qualityScore, reviewScore, threshold, scalingConstant]);

    const newDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const newGlobal = await publicContract.read.global_reputation([ownerAddress]);

    const expectedDelta = BigInt(5);
    expect(newDomain).to.equal(oldDomain + expectedDelta);
    expect(newGlobal).to.equal(oldGlobal + expectedDelta);
  });
  it("Moderation: deviation = threshold → no change", async () => {
    const domain = 0;
    const qualityScore = BigInt(90);
    const reviewScore = BigInt(80);
    const threshold = BigInt(10);
    const scalingConstant = BigInt(10);

    const oldDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const oldGlobal = await publicContract.read.global_reputation([ownerAddress]);

    await contract.write.updateModerationReputation([ownerAddress, domain, qualityScore, reviewScore, threshold, scalingConstant]);

    const newDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const newGlobal = await publicContract.read.global_reputation([ownerAddress]);

    const expectedDelta = BigInt(0);
    expect(newDomain).to.equal(oldDomain + expectedDelta);
    expect(newGlobal).to.equal(oldGlobal + expectedDelta);
  });
  it("Moderation: large deviation (> threshold) → negative delta", async () => {
    const domain = 0;
    const qualityScore = BigInt(50);
    const reviewScore = BigInt(80);
    const threshold = BigInt(10);
    const scalingConstant = BigInt(10);

    const oldDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const oldGlobal = await publicContract.read.global_reputation([ownerAddress]);

    await contract.write.updateModerationReputation([ownerAddress, domain, qualityScore, reviewScore, threshold, scalingConstant]);

    const newDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const newGlobal = await publicContract.read.global_reputation([ownerAddress]);

    const expectedDelta = BigInt(-2);
    expect(newDomain).to.equal(oldDomain + expectedDelta);
    expect(newGlobal).to.equal(oldGlobal + expectedDelta);
  });

  it("Difficulty-weight & scaling_constant effects: scaling_constant scales linearly", async () => {
    const domain = 0;
    const threshold = BigInt(50);
    const finalScore = BigInt(100);
    const difficulty = 0; // EASY

    // initial reputation
    const baseDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);

    // scaling constant 1
    const scale1 = BigInt(1);
    await contract.write.updateSolvingProblemReputation([ownerAddress, domain, finalScore, threshold, scale1, difficulty]);
    const afterScale1 = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const delta1 = afterScale1 - baseDomain;

    // scaling constant 3
    const scale3 = BigInt(3);
    await contract.write.updateSolvingProblemReputation([ownerAddress, domain, finalScore, threshold, scale3, difficulty]);
    const afterScale3 = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const delta3 = afterScale3 - afterScale1;

    // delta3 should be exactly 3 times delta1
    expect(Number(delta1)).to.be.gt(0);
    expect(delta3).to.equal(BigInt(delta1) * scale3);
  });
  it("Difficulty-weight & scaling_constant effects: difficulty_weight scales linearly", async () => {
    const domain = 0;
    const threshold = BigInt(50);
    const finalScore = BigInt(100);
    const scalingConstant = BigInt(100);

    // weights from Constants.sol
    const easyWeight = BigInt(100);
    const hardWeight = BigInt(140);

    // initial reputation
    const baseDomain = await publicContract.read.domain_reputation([ownerAddress, domain]);

    // EASY difficulty
    const easyDiff = 0;
    await contract.write.updateSolvingProblemReputation([ownerAddress, domain, finalScore, threshold, scalingConstant, easyDiff]);
    const afterEasy = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const deltaEasy = afterEasy - baseDomain;

    // HARD difficulty
    const hardDiff = 2;
    await contract.write.updateSolvingProblemReputation([ownerAddress, domain, finalScore, threshold, scalingConstant, hardDiff]);
    const afterHard = await publicContract.read.domain_reputation([ownerAddress, domain]);
    const deltaHard = afterHard - afterEasy;

    // Expected: hardWeight/easyWeight = deltaHard/deltaEasy
    // => deltaHard * easyWeight == deltaEasy * hardWeight
    expect(Number(deltaEasy)).to.be.gt(0);
    expect(BigInt(deltaHard) * easyWeight).to.equal(BigInt(deltaEasy) * hardWeight);
  });

});
