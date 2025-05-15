import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LibrariesModule = buildModule("LibrariesModule", (m) => {
  const mathUtils = m.library("MathUtils");
  const weights = m.library("Weights");
  
  return { mathUtils, weights };
});

export default LibrariesModule;