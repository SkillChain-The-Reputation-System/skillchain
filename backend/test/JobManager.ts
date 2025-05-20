import { expect } from "chai";
import hre from "hardhat";
import { parseEventLogs } from "viem";

import JobManagerModule from "../ignition/modules/JobManager";

describe("JobManager", () => {
  let publicClient: any;
  let ownerClient: any, recruiter1: any, recruiter2: any;
  let ownerAddress: string,
    recruiter1Address: string,
    recruiter2Address: string;
  let contract: any;
  let publicContract: any;

  beforeEach(async () => {
    // Setup clients
    publicClient = await hre.viem.getPublicClient();
    [ownerClient, recruiter1, recruiter2] = await hre.viem.getWalletClients();
    ownerAddress = ownerClient.account.address;
    recruiter1Address = recruiter1.account.address;
    recruiter2Address = recruiter2.account.address;

    console.log("Owner Address:", ownerAddress);
    console.log("Recruiter 1 Address:", recruiter1Address);
    console.log("Recruiter 2 Address:", recruiter2Address);

    // Deploy the contract using Ignition
    const deployment = await hre.ignition.deploy(JobManagerModule);
    contract = deployment.jobManager;

    // Create a contract instance for reading with the public client
    publicContract = await hre.viem.getContractAt(
      "JobManager",
      contract.address,
      { client: { wallet: publicClient } }
    );
  });

  /** Helper function to get a contract instance for a specific client */
  const getContractForClient = async (_client: any) => {
    return await hre.viem.getContractAt("JobManager", contract.address, {
      client: { wallet: _client },
    });
  };

  describe("Job Creation", () => {
    it("should create a job posting", async () => {
      const contractForRecruiter1 = await getContractForClient(recruiter1);
      const content_url = "ipfs://QmTestContent";

      // Create the job
      const tx = await contractForRecruiter1.write.createJob([content_url]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });

      // Parse event logs
      const events = parseEventLogs({
        abi: contractForRecruiter1.abi,
        logs: receipt.logs,
      }) as any[];

      // Verify that JobCreated event was emitted
      expect(events.length).to.equal(1);
      expect(events[0].eventName).to.equal("JobCreated");

      const jobId = events[0].args.id;

      // Check that the job was created correctlyshould not create a job with empty content URL:
      const job = await publicContract.read.getJob([jobId]);
      expect(job.id.toLowerCase()).to.equal(jobId.toLowerCase());
      expect(job.recruiter.toLowerCase()).to.equal(
        recruiter1Address.toLowerCase()
      );
      expect(job.content_url).to.equal(content_url);
      expect(job.status).to.equal(0); // DRAFT status
    });

    it("should not create a job with empty content URL", async () => {
      const contractForRecruiter1 = await getContractForClient(recruiter1);
      await expect(
        contractForRecruiter1.write.createJob([""])
      ).to.be.rejectedWith("Content URL cannot be empty");
    });
  });

  describe("Job Status Management", () => {
    let jobId: string;
    let contractForRecruiter1: any;

    beforeEach(async () => {
      // Create a job for testing status changes
      contractForRecruiter1 = await getContractForClient(recruiter1);
      const content_url = "ipfs://QmTestContent";

      // Create the job
      const tx = await contractForRecruiter1.write.createJob([content_url]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });

      // Parse event logs to get the job ID
      const events = parseEventLogs({
        abi: contractForRecruiter1.abi,
        logs: receipt.logs,
      }) as any[];

      jobId = events[0].args.id;
    });

    it("should publish a draft job", async () => {
      // Publish the job (change status from DRAFT to OPEN)
      const tx = await contractForRecruiter1.write.publishJob([jobId]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });

      const events = parseEventLogs({
        abi: contractForRecruiter1.abi,
        logs: receipt.logs,
      }) as any[];

      // Verify that JobPublished event was emitted
      expect(events.length).to.equal(1);
      expect(events[0].eventName).to.equal("JobPublished");

      // Check job status
      const job = await publicContract.read.getJob([jobId]);
      expect(job.status).to.equal(1); // OPEN status
    });

    it("should pause an open job", async () => {
      // First publish the job
      await contractForRecruiter1.write.publishJob([jobId]);

      // Then pause it
      const tx = await contractForRecruiter1.write.pauseJob([jobId]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });

      const events = parseEventLogs({
        abi: contractForRecruiter1.abi,
        logs: receipt.logs,
      }) as any[];

      // Verify that JobPaused event was emitted
      expect(events.length).to.equal(1);
      expect(events[0].eventName).to.equal("JobPaused");

      // Check job status
      const job = await publicContract.read.getJob([jobId]);
      expect(job.status).to.equal(2); // PAUSED status
    });

    it("should resume a paused job", async () => {
      // First publish the job
      await contractForRecruiter1.write.publishJob([jobId]);

      // Then pause it
      await contractForRecruiter1.write.pauseJob([jobId]);

      // Then resume it
      const tx = await contractForRecruiter1.write.resumeJob([jobId]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });

      const events = parseEventLogs({
        abi: contractForRecruiter1.abi,
        logs: receipt.logs,
      }) as any[];

      // Verify that JobResumed event was emitted
      expect(events.length).to.equal(1);
      expect(events[0].eventName).to.equal("JobResumed");

      // Check job status
      const job = await publicContract.read.getJob([jobId]);
      expect(job.status).to.equal(1); // OPEN status
    });

    it("should fill an open job", async () => {
      // First publish the job
      await contractForRecruiter1.write.publishJob([jobId]);

      // Then fill it
      const tx = await contractForRecruiter1.write.fillJob([jobId]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });

      const events = parseEventLogs({
        abi: contractForRecruiter1.abi,
        logs: receipt.logs,
      }) as any[];

      // Verify that JobFilled event was emitted
      expect(events.length).to.equal(1);
      expect(events[0].eventName).to.equal("JobFilled");

      // Check job status
      const job = await publicContract.read.getJob([jobId]);
      expect(job.status).to.equal(4); // FILLED status
    });

    it("should close an open job", async () => {
      // First publish the job
      await contractForRecruiter1.write.publishJob([jobId]);

      // Then close it
      const tx = await contractForRecruiter1.write.closeJob([jobId]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });

      const events = parseEventLogs({
        abi: contractForRecruiter1.abi,
        logs: receipt.logs,
      }) as any[];

      // Verify that JobClosed event was emitted
      expect(events.length).to.equal(1);
      expect(events[0].eventName).to.equal("JobClosed");

      // Check job status
      const job = await publicContract.read.getJob([jobId]);
      expect(job.status).to.equal(3); // CLOSED status
    });

    it("should close a paused job", async () => {
      // First publish the job
      await contractForRecruiter1.write.publishJob([jobId]);

      // Then pause it
      await contractForRecruiter1.write.pauseJob([jobId]);

      // Then close it
      const tx = await contractForRecruiter1.write.closeJob([jobId]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });

      // Check job status
      const job = await publicContract.read.getJob([jobId]);
      expect(job.status).to.equal(3); // CLOSED status
    });

    it("should close a filled job", async () => {
      // First publish the job
      await contractForRecruiter1.write.publishJob([jobId]);

      // Then fill it
      await contractForRecruiter1.write.fillJob([jobId]);

      // Then close it
      const tx = await contractForRecruiter1.write.closeJob([jobId]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });

      // Check job status
      const job = await publicContract.read.getJob([jobId]);
      expect(job.status).to.equal(3); // CLOSED status
    });

    it("should archive a closed job", async () => {
      // First publish the job
      await contractForRecruiter1.write.publishJob([jobId]);

      // Then close it
      await contractForRecruiter1.write.closeJob([jobId]);

      // Then archive it
      const tx = await contractForRecruiter1.write.archiveJob([jobId]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });

      const events = parseEventLogs({
        abi: contractForRecruiter1.abi,
        logs: receipt.logs,
      }) as any[];

      // Verify that JobArchived event was emitted
      expect(events.length).to.equal(1);
      expect(events[0].eventName).to.equal("JobArchived");

      // Check job status
      const job = await publicContract.read.getJob([jobId]);
      expect(job.status).to.equal(5); // ARCHIVED status
    });

    it("should archive a draft job", async () => {
      // Archive the job directly from draft status
      const tx = await contractForRecruiter1.write.archiveJob([jobId]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });

      // Check job status
      const job = await publicContract.read.getJob([jobId]);
      expect(job.status).to.equal(5); // ARCHIVED status
    });
  });

  describe("Job Access Controls", () => {
    let jobId: string;
    let contractForRecruiter1: any;
    let contractForRecruiter2: any;

    beforeEach(async () => {
      // Create a job for testing access controls
      contractForRecruiter1 = await getContractForClient(recruiter1);
      contractForRecruiter2 = await getContractForClient(recruiter2);

      const content_url = "ipfs://QmTestContent";

      // Create the job
      const tx = await contractForRecruiter1.write.createJob([content_url]);
      const receipt = await publicClient.getTransactionReceipt({ hash: tx });

      // Parse event logs to get the job ID
      const events = parseEventLogs({
        abi: contractForRecruiter1.abi,
        logs: receipt.logs,
      }) as any[];

      jobId = events[0].args.id;
    });

    it("should not allow a non-owner to modify a job", async () => {
      // Attempt to publish the job by the non-owner
      try {
        await contractForRecruiter2.write.publishJob([jobId]);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).to.include(
          "You are not the owner of this job posting"
        );
      }
    });

    it("should not allow publishing a job that is not in DRAFT status", async () => {
      // First publish the job
      await contractForRecruiter1.write.publishJob([jobId]);

      // Attempt to publish it again
      try {
        await contractForRecruiter1.write.publishJob([jobId]);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).to.include("Job is not in DRAFT status");
      }
    });

    it("should not allow pausing a job that is not in OPEN status", async () => {
      // Attempt to pause a job that is still in DRAFT status
      try {
        await contractForRecruiter1.write.pauseJob([jobId]);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).to.include("Job is not in OPEN status");
      }
    });

    it("should not allow resuming a job that is not in PAUSED status", async () => {
      // Publish the job
      await contractForRecruiter1.write.publishJob([jobId]);

      // Attempt to resume a job that is in OPEN status (not PAUSED)
      try {
        await contractForRecruiter1.write.resumeJob([jobId]);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).to.include("Job is not in PAUSED status");
      }
    });

    it("should not allow filling a job that is not in OPEN status", async () => {
      // Attempt to fill a job that is still in DRAFT status
      try {
        await contractForRecruiter1.write.fillJob([jobId]);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).to.include("Job is not in OPEN status");
      }
    });
  });

  describe("Job Querying Functions", () => {
    let jobIds: string[] = [];
    let contractForRecruiter1: any;
    let contractForRecruiter2: any;

    beforeEach(async () => {
      jobIds = []; // Reset job IDs for each test
      contractForRecruiter1 = await getContractForClient(recruiter1);
      contractForRecruiter2 = await getContractForClient(recruiter2);

      // Create multiple jobs with different statuses
      // Job 1: OPEN from recruiter1
      const tx1 = await contractForRecruiter1.write.createJob([
        "ipfs://QmJob1",
      ]);
      const receipt1 = await publicClient.getTransactionReceipt({ hash: tx1 });
      const events1 = parseEventLogs({
        abi: contractForRecruiter1.abi,
        logs: receipt1.logs,
      }) as any[];
      jobIds.push(events1[0].args.id);
      await contractForRecruiter1.write.publishJob([jobIds[0]]); // DRAFT -> OPEN

      // Job 2: PAUSED from recruiter1
      const tx2 = await contractForRecruiter1.write.createJob([
        "ipfs://QmJob2",
      ]);
      const receipt2 = await publicClient.getTransactionReceipt({ hash: tx2 });
      const events2 = parseEventLogs({
        abi: contractForRecruiter1.abi,
        logs: receipt2.logs,
      }) as any[];
      jobIds.push(events2[0].args.id);
      await contractForRecruiter1.write.publishJob([jobIds[1]]); // DRAFT -> OPEN
      await contractForRecruiter1.write.pauseJob([jobIds[1]]); // OPEN -> PAUSED

      // Job 3: CLOSED from recruiter1
      const tx3 = await contractForRecruiter1.write.createJob([
        "ipfs://QmJob3",
      ]);
      const receipt3 = await publicClient.getTransactionReceipt({ hash: tx3 });
      const events3 = parseEventLogs({
        abi: contractForRecruiter1.abi,
        logs: receipt3.logs,
      }) as any[];
      jobIds.push(events3[0].args.id);
      await contractForRecruiter1.write.publishJob([jobIds[2]]); // DRAFT -> OPEN
      await contractForRecruiter1.write.closeJob([jobIds[2]]); // OPEN -> CLOSED

      // Job 4: DRAFT from recruiter2
      const tx4 = await contractForRecruiter2.write.createJob([
        "ipfs://QmJob4",
      ]);
      const receipt4 = await publicClient.getTransactionReceipt({ hash: tx4 });
      const events4 = parseEventLogs({
        abi: contractForRecruiter2.abi,
        logs: receipt4.logs,
      }) as any[];
      jobIds.push(events4[0].args.id);

      // Job 5: OPEN from recruiter2
      const tx5 = await contractForRecruiter2.write.createJob([
        "ipfs://QmJob5",
      ]);
      const receipt5 = await publicClient.getTransactionReceipt({ hash: tx5 });
      const events5 = parseEventLogs({
        abi: contractForRecruiter2.abi,
        logs: receipt5.logs,
      }) as any[];

      jobIds.push(events5[0].args.id);
      await contractForRecruiter2.write.publishJob([jobIds[4]]); // DRAFT -> OPEN
    });

    it("should get all open jobs", async () => {
      const openJobs = await publicContract.read.getAllOpenJobs();

      // We should have 2 open jobs (Job 1 and Job 5)
      expect(openJobs.length).to.equal(2);

      // Check that they have the correct status
      for (const job of openJobs) {
        expect(job.status).to.equal(1); // OPEN status
      }
      // Check that the correct job IDs are returned
      const openJobIds = openJobs.map((job: { id: string }) => job.id);
      expect(openJobIds).to.include(jobIds[0]); // Job 1
      expect(openJobIds).to.include(jobIds[4]); // Job 5
    });

    it("should get jobs by recruiter", async () => {
      // Get jobs for recruiter1
      const recruiter1Jobs = await publicContract.read.getJobsByRecruiter([
        recruiter1Address,
      ]);

      // Recruiter1 should have 3 jobs (Job 1, Job 2, Job 3)
      expect(recruiter1Jobs.length).to.equal(3);

      const recruiter1JobIds = recruiter1Jobs.map(
        (job: { id: string }) => job.id
      );
      expect(recruiter1JobIds).to.include(jobIds[0]); // Job 1
      expect(recruiter1JobIds).to.include(jobIds[1]); // Job 2
      expect(recruiter1JobIds).to.include(jobIds[2]); // Job 3

      // Get jobs for recruiter2
      const recruiter2Jobs = await publicContract.read.getJobsByRecruiter([
        recruiter2Address,
      ]);

      // Recruiter2 should have 2 jobs (Job 4, Job 5)
      expect(recruiter2Jobs.length).to.equal(2);

      const recruiter2JobIds = recruiter2Jobs.map(
        (job: { id: string }) => job.id
      );
      expect(recruiter2JobIds).to.include(jobIds[3]); // Job 4
      expect(recruiter2JobIds).to.include(jobIds[4]); // Job 5
    });

    it("should get jobs by status", async () => {
      // Get jobs with OPEN status
      const openJobs = await publicContract.read.getJobsByStatus([1]); // 1 = OPEN

      // We should have 2 open jobs (Job 1 and Job 5)
      expect(openJobs.length).to.equal(2);

      const openJobIds = openJobs.map((job: { id: string }) => job.id);
      expect(openJobIds).to.include(jobIds[0]); // Job 1
      expect(openJobIds).to.include(jobIds[4]); // Job 5

      // Get jobs with PAUSED status
      const pausedJobs = await publicContract.read.getJobsByStatus([2]); // 2 = PAUSED

      // We should have 1 paused job (Job 2)
      expect(pausedJobs.length).to.equal(1);
      expect(pausedJobs[0].id).to.equal(jobIds[1]); // Job 2

      // Get jobs with CLOSED status
      const closedJobs = await publicContract.read.getJobsByStatus([3]); // 3 = CLOSED

      // We should have 1 closed job (Job 3)
      expect(closedJobs.length).to.equal(1);
      expect(closedJobs[0].id).to.equal(jobIds[2]); // Job 3

      // Get jobs with DRAFT status
      const draftJobs = await publicContract.read.getJobsByStatus([0]); // 0 = DRAFT

      // We should have 1 draft job (Job 4)
      expect(draftJobs.length).to.equal(1);
      expect(draftJobs[0].id).to.equal(jobIds[3]); // Job 4
    });
  });
});
