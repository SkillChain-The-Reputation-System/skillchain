import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ChallengeManagerModule from "../ChallengeManager";
import RoleManagerModule from "../RoleManager";

const SetRoleManagerOnChallengeManagerModule = buildModule(
  "SetRoleManagerOnChallengeManagerModule",
  (m) => {
    const { challengeManager } = m.useModule(ChallengeManagerModule);
    const { roleManager } = m.useModule(RoleManagerModule);

    m.call(challengeManager, "setRoleManagerAddress", [roleManager], {
      id: "setRoleManagerOnChallengeManager",
    });

    return {
      challengeManager,
      roleManager,
    };
  }
);

export default SetRoleManagerOnChallengeManagerModule;
