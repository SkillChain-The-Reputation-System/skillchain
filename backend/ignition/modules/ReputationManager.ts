import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ReputationManagerModule = buildModule("ReputationManagerModule", (m) => {
  const ReputationManagerModule = m.contract("ReputationManager");
  return { ReputationManagerModule };
});

export default ReputationManagerModule;