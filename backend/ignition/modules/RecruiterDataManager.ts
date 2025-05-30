import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RecruiterDataManagerModule = buildModule("RecruiterDataManagerModule", (m) => {
  const recruiterDataManager = m.contract("RecruiterDataManager");
  return { recruiterDataManager };
});

export default RecruiterDataManagerModule;