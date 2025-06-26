import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WeightsModule = buildModule("WeightsModule", (m) => {
  const weights = m.library("Weights");

  return { weights };
});

export default WeightsModule;
