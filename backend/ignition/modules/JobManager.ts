import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const JobManagerModule = buildModule("JobManagerModule", (m) => {
  // Deploy JobManager contract
  // JobManager only imports Constants.sol which contains enums and doesn't need linking
  const jobManager = m.contract("JobManager");
  
  return { jobManager };
});

export default JobManagerModule;
