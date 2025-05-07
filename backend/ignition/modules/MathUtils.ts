import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MathUtilsModule = buildModule("MathUtilsModule", (m) => {
  const MathUtils = m.contract("MathUtils");
  return { MathUtils };
});

export default MathUtilsModule;