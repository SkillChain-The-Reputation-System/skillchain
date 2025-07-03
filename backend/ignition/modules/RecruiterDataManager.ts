import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RecruiterDataManagerModule = buildModule("RecruiterDataManagerModule", (m) => {
  // Phase 1: Deploy RecruiterDataManager contract without dependencies
  const recruiterDataManager = m.contract("RecruiterDataManager");
  
  return { recruiterDataManager };
});

export default RecruiterDataManagerModule;