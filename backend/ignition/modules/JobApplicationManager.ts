import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import JobManagerModule from "./JobManager";

const JobApplicationManagerModule = buildModule("JobApplicationManagerModule", (m) => {
  // Import the JobManager from its module
  const { jobManager } = m.useModule(JobManagerModule);
  
  // Deploy JobApplicationManager contract
  const jobApplicationManager = m.contract("JobApplicationManager");
  
  // Set the JobManager address on the JobApplicationManager
  m.call(jobApplicationManager, "setJobManagerAddress", [jobManager]);
  
  // Return both contracts
  return { jobApplicationManager, jobManager };
});

export default JobApplicationManagerModule;
