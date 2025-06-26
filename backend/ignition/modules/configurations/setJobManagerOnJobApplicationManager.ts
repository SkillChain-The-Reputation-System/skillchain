import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import JobApplicationManagerModule from "../JobApplicationManager";
import JobManagerModule from "../JobManager";

const SetJobManagerOnJobApplicationManagerModule = buildModule(
  "SetJobManagerOnJobApplicationManagerModule",
  (m) => {
    const { jobApplicationManager } = m.useModule(JobApplicationManagerModule);
    const { jobManager } = m.useModule(JobManagerModule);

    m.call(jobApplicationManager, "setJobManagerAddress", [jobManager], {
      id: "setJobManagerOnJobApplicationManager",
    });

    return {
      jobApplicationManager,
      jobManager,
    };
  }
);

export default SetJobManagerOnJobApplicationManagerModule;
