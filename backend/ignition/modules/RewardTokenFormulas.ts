import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RewardTokenFormulasModule = buildModule("RewardTokenFormulasModule", (m) => {
  const rewardTokenFormulas = m.library("RewardTokenFormulas");

  return { rewardTokenFormulas };
});

export default RewardTokenFormulasModule;
