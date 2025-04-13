import { expect } from "chai";
import hre from "hardhat";
import { parseEventLogs } from "viem";

describe("UserDataManager", () => {
  let publicClient: any; // Client used to peform read-only process to the contract
  let ownerClient: any,
    client1: any,
    client2: any,
    client3: any;
  let owner_address: any,
    client1_address: any,
    client2_address: any,
    client3_address: any;
  let contract: any;
  let publicContract: any;

  beforeEach(async () => {
    // Get clients from Hardhat Viem plugin
    publicClient = await hre.viem.getPublicClient();
    [ownerClient, client1, client2, client3] =
      await hre.viem.getWalletClients();

    // Extract addresses from wallet clients
    owner_address = ownerClient.account.address;
    client1_address = client1.account.address;
    client2_address = client2.account.address;
    client3_address = client3.account.address;

    console.log("Owner Address:", owner_address);
    console.log("Client 1 Address:", client1_address);
    console.log("Client 2 Address:", client2_address);
    console.log("Client 3 Address:", client3_address);

    // Deploy the contract
    contract = await hre.viem.deployContract("UserDataManager", [], {
      client: {
        wallet: ownerClient,
      }});

    // Create a contract instance for reading with the public client
    publicContract = await hre.viem.getContractAt(
      "UserDataManager",
      contract.address,
      { client: {wallet: publicClient}}
    );
  });

  /** Helper function to get a contract instance for a specific client */
  const getContractForClient = async (_client: any) => {
    return await hre.viem.getContractAt("UserDataManager", contract.address, {
      client: {wallet: _client},
    });
  };

  describe("setUserPersonalData", () => {
    it("should return empty strings for everything if no data is set", async () => {
      const client1_username = await publicContract.read.getUsername([client1_address]);
      const client1_avatar = await publicContract.read.getAvatar([client1_address]);
      const client1_bio = await publicContract.read.getBio([client1_address]);

      expect(client1_username).to.equal("");
      expect(client1_avatar).to.equal("");
      expect(client1_bio).to.equal("");

      const client2_username = await publicContract.read.getUsername([client2_address]);
      const client2_avatar = await publicContract.read.getAvatar([client2_address]);
      const client2_bio = await publicContract.read.getBio([client2_address]);

      expect(client2_username).to.equal("");
      expect(client2_avatar).to.equal("");
      expect(client2_bio).to.equal("");

      const client3_username = await publicContract.read.getUsername([client3_address]);
      const client3_avatar = await publicContract.read.getAvatar([client3_address]);
      const client3_bio = await publicContract.read.getBio([client3_address]);

      expect(client3_username).to.equal("");
      expect(client3_avatar).to.equal("");
      expect(client3_bio).to.equal("");
    });

    it("should allow a user to set personal data", async () => {
      const contractForAddr1 = await getContractForClient(client1);
      const new_username = "alice";
      const new_avatar = "avatar";
      const new_bio = "bio";

      // console.log("Contract1:", contractForAddr1.address);
      // console.log("Address 1 Client:", client1);

      await contractForAddr1.write.setUserPersonalData([new_username, new_avatar, new_bio]);

      const username_read_by_public = await publicContract.read.getUsername([client1_address]);
      const avatar_read_by_public = await publicContract.read.getAvatar([client1_address]);
      const bio_read_by_public = await publicContract.read.getBio([client1_address]);

      expect(username_read_by_public).to.equal(new_username);
      expect(avatar_read_by_public).to.equal(new_avatar);
      expect(bio_read_by_public).to.equal(new_bio);

      const username_read_by_client1 = await contractForAddr1.read.getUsername([client1_address]);
      const avatar_read_by_client1 = await contractForAddr1.read.getAvatar([client1_address]);
      const bio_read_by_client1 = await contractForAddr1.read.getBio([client1_address]);

      expect(username_read_by_client1).to.equal(new_username);
      expect(avatar_read_by_client1).to.equal(new_avatar);
      expect(bio_read_by_client1).to.equal(new_bio);

    });

    it("should allow a user to update personal data partially (empty username)", async () => {
      const contractForAddr1 = await getContractForClient(client1);
      const new_username = "";
      const new_avatar = "avatar";
      const new_bio = "bio";

      const tx = await contractForAddr1.write.setUserPersonalData([new_username, new_avatar, new_bio]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });
      const events = parseEventLogs({
        abi: contractForAddr1.abi,
        logs: receipt.logs,
      }) as any[];

      // console.log("Events:", events);

      const username = await publicContract.read.getUsername([client1_address]);
      const avatar = await publicContract.read.getAvatar([client1_address]);
      const bio = await publicContract.read.getBio([client1_address]);
      
      expect(username).to.equal(new_username);
      expect(avatar).to.equal(new_avatar);
      expect(bio).to.equal(new_bio);
    });

    it("should allow a user to update personal data partially (empty avatar)", async () => {
      const contractForAddr1 = await getContractForClient(client1);
      const new_username = "alice";
      const new_avatar = "";
      const new_bio = "bio";

      const tx = await contractForAddr1.write.setUserPersonalData([new_username, new_avatar, new_bio]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });
      const events = parseEventLogs({
        abi: contractForAddr1.abi,
        logs: receipt.logs,
      }) as any[];

      // console.log("Events:", events);

      const username = await publicContract.read.getUsername([client1_address]);
      const avatar = await publicContract.read.getAvatar([client1_address]);
      const bio = await publicContract.read.getBio([client1_address]);
      
      expect(username).to.equal(new_username);
      expect(avatar).to.equal(new_avatar);
      expect(bio).to.equal(new_bio);
    });

    it("should allow a user to update personal data partially (empty bio)", async () => {
      const contractForAddr1 = await getContractForClient(client1);
      const new_username = "alice";
      const new_avatar = "avatar";
      const new_bio = "";

      const tx = await contractForAddr1.write.setUserPersonalData([new_username, new_avatar, new_bio]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });
      const events = parseEventLogs({
        abi: contractForAddr1.abi,
        logs: receipt.logs,
      }) as any[];

      // console.log("Events:", events);

      const username = await publicContract.read.getUsername([client1_address]);
      const avatar = await publicContract.read.getAvatar([client1_address]);
      const bio = await publicContract.read.getBio([client1_address]);
      
      expect(username).to.equal(new_username);
      expect(avatar).to.equal(new_avatar);
      expect(bio).to.equal(new_bio);
    });

    it("should not allow a user to update personal data when all input is empty", async () => {
      const contractForAddr1 = await getContractForClient(client1);
      const new_username = "";
      const new_avatar = "";
      const new_bio = "";

      try {
        await contractForAddr1.write.setUserPersonalData([new_username, new_avatar, new_bio]);
      }
      catch (error:any) {
        expect(error.message).to.include("No data to update");
      }
    });

    it("should allow a user to update their username multiple times", async () => {
      const contractForAddr1 = await getContractForClient(client1);
      const new_username_1 = "alice";
      const new_username_2 = "bob";
      const new_username_3 = "charlie";

      await contractForAddr1.write.setUserPersonalData([new_username_1, "", ""]);
      expect(await publicContract.read.getUsername([client1_address])).to.equal(new_username_1);

      await contractForAddr1.write.setUserPersonalData([new_username_2, "", ""]);
      expect(await publicContract.read.getUsername([client1_address])).to.equal(new_username_2);
      
      await contractForAddr1.write.setUserPersonalData([new_username_3, "", ""]);
      expect(await publicContract.read.getUsername([client1_address])).to.equal(new_username_3);
    });

    it("should not allow a user to set a username that is already taken", async () => {
      const contractForAddr1 = await getContractForClient(client1);
      const contractForAddr2 = await getContractForClient(client2);
      const new_username_1 = "alice";
      const new_avatar_1 = "avatar1";
      const new_bio_1 = "bio1";
      const new_username_2 = "bob";
      const new_avatar_2 = "avatar2";
      const new_bio_2 = "bio2";

      await contractForAddr1.write.setUserPersonalData([new_username_1, new_avatar_1, new_bio_1]);
      expect(await publicContract.read.getUsername([client1_address])).to.equal(new_username_1);
      expect(await publicContract.read.getAvatar([client1_address])).to.equal(new_avatar_1);
      expect(await publicContract.read.getBio([client1_address])).to.equal(new_bio_1);

      await contractForAddr2.write.setUserPersonalData([new_username_1, new_avatar_2, new_bio_2]);
      expect(await publicContract.read.getUsername([client2_address])).to.equal("");
      expect(await publicContract.read.getAvatar([client2_address])).to.equal(new_avatar_2);
      expect(await publicContract.read.getBio([client2_address])).to.equal(new_bio_2);

      await contractForAddr2.write.setUserPersonalData([new_username_2, new_avatar_2, new_bio_2]);
      expect(await publicContract.read.getUsername([client2_address])).to.equal(new_username_2);
      expect(await publicContract.read.getAvatar([client2_address])).to.equal(new_avatar_2);
      expect(await publicContract.read.getBio([client2_address])).to.equal(new_bio_2);
    })

    it("should not update a field if the new value is the same as the old value", async () => {
      const contractForAddr1 = await getContractForClient(client1);
      const new_username = "alice";
      const new_avatar = "avatar";
      const new_bio = "bio";

      await contractForAddr1.write.setUserPersonalData([new_username, new_avatar, new_bio]);

      const tx = await contractForAddr1.write.setUserPersonalData([new_username, new_avatar, new_bio]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });
      const events = parseEventLogs({
        abi: contractForAddr1.abi,
        logs: receipt.logs,
      }) as any[];

      // console.log(events);

      // console.log("Events:", events);
      expect(events.length).to.equal(0); // No events should be emitted
    });

  });
});
