import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ConstantsModule = buildModule("ConstantsModule", (m) => {
  const Constants = m.contract("Constants");
  return { Constants };
});

export default ConstantsModule;