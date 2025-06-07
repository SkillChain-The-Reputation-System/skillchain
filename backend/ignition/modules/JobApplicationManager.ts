import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import JobManagerModule from "./JobManager";
import RecruiterSubscriptionModule from "./RecruiterSubscription";

const JobApplicationManagerModule = buildModule("JobApplicationManagerModule", (m) => {
  // Import the JobManager from its module
  const { jobManager, recruiterSubscription } = m.useModule(JobManagerModule);
  m.useModule(RecruiterSubscriptionModule); // ensure deployment if not from JobManager
  
  // Deploy JobApplicationManager contract
  const jobApplicationManager = m.contract("JobApplicationManager");
  
  // Set the JobManager address on the JobApplicationManager
  m.call(jobApplicationManager, "setJobManagerAddress", [jobManager]);
  m.call(jobApplicationManager, "setRecruiterSubscriptionAddress", [recruiterSubscription]);
  
  // Return both contracts
  return { jobApplicationManager, jobManager, recruiterSubscription };
});

export default JobApplicationManagerModule;
