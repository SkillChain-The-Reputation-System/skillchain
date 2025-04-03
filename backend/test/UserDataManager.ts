import { expect } from "chai";
import hre from "hardhat";
import {
  parseEventLogs,
} from "viem";

describe("UserDataManager", () => {
  let publicClient: any; // Client used to peform read-only process to the contract
  let ownerClient: any,
    addr1Client: any,
    addr2Client: any,
    addr3Client: any;
  let ownerAddress: any,
    addr1Address: any,
    addr2Address: any,
    addr3Address: any;
  let contract: any;
  let publicContract: any;

  beforeEach(async () => {
    // Get clients from Hardhat Viem plugin
    publicClient = await hre.viem.getPublicClient();
    [ownerClient, addr1Client, addr2Client, addr3Client] =
      await hre.viem.getWalletClients();

    // Extract addresses from wallet clients
    ownerAddress = ownerClient.account.address;
    addr1Address = addr1Client.account.address;
    addr2Address = addr2Client.account.address;
    addr3Address = addr3Client.account.address;

    // Deploy the contract
    contract = await hre.viem.deployContract("UserDataManager", [], {
      client: {
        wallet: ownerClient,
      }});

    // Create a contract instance for reading with the public client
    publicContract = await hre.viem.getContractAt(
      "UserDataManager",
      contract.address,
      { client: publicClient}
    );
  });

  /** Helper function to get a contract instance for a specific client */
  const getContractForClient = async (_client: any) => {
    return await hre.viem.getContractAt("UserDataManager", contract.address, {
      client: _client,
    });
  };

  describe("registerUsername", () => {
    it("should allow a user to set their username and emit UsernameRegistered event", async () => {
      const contractForAddr1 = await getContractForClient(addr1Client);
      const tx = await contractForAddr1.write.registerUsername(["alice"]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });
      const events = parseEventLogs({
        abi: contractForAddr1.abi,
        logs: receipt.logs,
      }) as any[];

      expect(events).to.have.lengthOf(1);
      expect(events[0].eventName).to.equal("UsernameRegistered");
      expect(events[0].args.user_address).to.equal(addr1Address);
      expect(events[0].args.username).to.equal("alice");

      const username = await publicContract.read.getUsername([addr1Address]);
      expect(username).to.equal("alice");
    });

    it("should not allow a user to update their username", async () => {
      const contractForAddr1 = await getContractForClient(addr1Client);
      await contractForAddr1.write.registerUsername(["alice"]);

      await expect(
        await contractForAddr1.write.registerUsername(["bob"])
      ).to.be.rejectedWith("Username already registered");
    });

    it("should not allow a user to set a username that is already taken", async () => {
      const contractForAddr1 = await getContractForClient(addr1Client);
      await contractForAddr1.write.registerUsername(["alice"]);

      const contractForAddr2 = await getContractForClient(addr2Client);
      await expect(
        contractForAddr2.write.registerUsername(["alice"])
      ).to.be.rejectedWith("Username already taken");
    });

    it("should not allow setting an empty username", async () => {
      const contractForAddr1 = await getContractForClient(addr1Client);
      await expect(
        await contractForAddr1.write.registerUsername([""])
      ).to.be.rejectedWith("Username cannot be empty");
    });
  });

  describe("updateAvatar", () => {
    it("should allow a user to update their avatar and emit AvatarUpdated event", async () => {
      const contractForAddr1 = await getContractForClient(addr1Client);
      const tx = await contractForAddr1.write.updateAvatar(["cid1"]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });
      const events = parseEventLogs({
        abi: contractForAddr1.abi,
        logs: receipt.logs,
      }) as any[];

      expect(events).to.have.lengthOf(1);
      expect(events[0].eventName).to.equal("AvatarUpdated");
      expect(events[0].args.user_address).to.equal(addr1Address);
      expect(events[0].args.cid_avatar).to.equal("cid1");

      const avatar = await publicContract.read.getAvatar([addr1Address]);
      expect(avatar).to.equal("cid1");
    });

    it("should allow updating avatar multiple times", async () => {
      const contractForAddr1 = await getContractForClient(addr1Client);

      await contractForAddr1.write.updateAvatar(["cid2"]);
      let avatar1 = await publicContract.read.getAvatar([addr1Address]);
      expect(avatar1).to.equal("cid2");
      
      await contractForAddr1.write.updateAvatar(["cid3"]);
      let avatar2 = await publicContract.read.getAvatar([addr1Address]);
      expect(avatar2).to.equal("cid3");
    });

    it("should allow different users to have the same avatar", async () => {
      const contractForAddr1 = await getContractForClient(addr1Client);
      const contractForAddr2 = await getContractForClient(addr2Client);
      await contractForAddr1.write.updateAvatar(["cid4"]);
      await contractForAddr2.write.updateAvatar(["cid4"]);

      const avatar1 = await publicContract.read.getAvatar([addr1Address]);
      const avatar2 = await publicContract.read.getAvatar([addr2Address]);
      expect(avatar1).to.equal("cid4");
      expect(avatar2).to.equal("cid4");
    });
  });

  describe("getUsername and getAvatar", () => {
    it("should return empty strings for a new user", async () => {
      const username = await publicContract.read.getUsername([addr1Address]);
      const avatar = await publicContract.read.getAvatar([addr1Address]);
      expect(username).to.equal("");
      expect(avatar).to.equal("");
    });

    it("should return correct values after setting", async () => {
      const contractForAddr1 = await getContractForClient(addr1Client);
      await contractForAddr1.write.registerUsername(["alice"]);
      await contractForAddr1.write.updateAvatar(["cid5"]);

      const username = await publicContract.read.getUsername([addr1Address]);
      const avatar = await publicContract.read.getAvatar([addr1Address]);
      expect(username).to.equal("alice");
      expect(avatar).to.equal("cid5");
    });
  });
});
