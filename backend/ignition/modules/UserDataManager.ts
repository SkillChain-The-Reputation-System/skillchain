import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UserDataManagerModule = buildModule("UserDataManagerModule", (m) => {
  const userDataManager = m.contract("UserDataManager");
  return { userDataManager };
});

export default UserDataManagerModule;