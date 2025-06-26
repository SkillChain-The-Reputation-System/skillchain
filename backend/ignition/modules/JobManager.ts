import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const JobManagerModule = buildModule("JobManagerModule", (m) => {
  // Phase 1: Deploy JobManager contract without dependencies
  const jobManager = m.contract("JobManager");

  return { jobManager };
});

export default JobManagerModule;
