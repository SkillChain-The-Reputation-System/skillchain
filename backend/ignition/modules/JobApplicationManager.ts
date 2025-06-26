import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const JobApplicationManagerModule = buildModule("JobApplicationManagerModule", (m) => {
  // Phase 1: Deploy JobApplicationManager contract without dependencies
  const jobApplicationManager = m.contract("JobApplicationManager");
  
  return { jobApplicationManager };
});

export default JobApplicationManagerModule;
