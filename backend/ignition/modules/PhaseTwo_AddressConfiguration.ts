import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ReputationManagerModule from "./ReputationManager";
import RoleManagerModule from "./RoleManager";
import ChallengeManagerModule from "./ChallengeManager";
import SolutionManagerModule from "./SolutionManager";
import ChallengeCostManagerModule from "./ChallengeCostManager";
import ModerationEscrowModule from "./ModerationEscrow";
import RecruiterSubscriptionModule from "./RecruiterSubscription";
import RecruiterDataManagerModule from "./RecruiterDataManager";
import JobManagerModule from "./JobManager";
import JobApplicationManagerModule from "./JobApplicationManager";
import MeetingManagerModule from "./MeetingManager";

const PhaseTwoAddressConfigurationModule = buildModule(
  "PhaseTwoAddressConfigurationModule",
  (m) => {
    // Phase 2: Import all deployed contracts
    const { reputationManager } = m.useModule(ReputationManagerModule);
    const { roleManager } = m.useModule(RoleManagerModule);
    const { challengeManager } = m.useModule(ChallengeManagerModule);
    const { solutionManager } = m.useModule(SolutionManagerModule);
    const { challengeCostManager } = m.useModule(ChallengeCostManagerModule);
    const { moderationEscrow } = m.useModule(ModerationEscrowModule);
    const { recruiterSubscription } = m.useModule(RecruiterSubscriptionModule);
    const { recruiterDataManager } = m.useModule(RecruiterDataManagerModule);
    const { jobManager } = m.useModule(JobManagerModule);
    const { jobApplicationManager } = m.useModule(JobApplicationManagerModule);
    const { meetingManager } = m.useModule(MeetingManagerModule);

    // Configure RoleManager ↔ ReputationManager
    m.call(roleManager, "setReputationManagerAddress", [reputationManager], {
      id: "setReputationManagerOnRoleManager",
    });
    m.call(reputationManager, "setRoleManagerAddress", [roleManager], {
      id: "setRoleManagerOnReputationManager",
    });

    // Configure ChallengeManager dependencies
    m.call(challengeManager, "setReputationManagerAddress", [reputationManager], {
      id: "setReputationManagerOnChallengeManager",
    });
    m.call(challengeManager, "setSolutionManagerAddress", [solutionManager], {
      id: "setSolutionManagerOnChallengeManager",
    });
    m.call(challengeManager, "setRoleManagerAddress", [roleManager], {
      id: "setRoleManagerOnChallengeManager",
    });
    m.call(challengeManager, "setChallengeCostManagerAddress", [challengeCostManager], {
      id: "setChallengeCostManagerOnChallengeManager",
    });
    m.call(challengeManager, "setModerationEscrowAddress", [moderationEscrow], {
      id: "setModerationEscrowOnChallengeManager",
    });

    // Configure SolutionManager dependencies
    m.call(solutionManager, "setChallengeManagerAddress", [challengeManager], {
      id: "setChallengeManagerOnSolutionManager",
    });
    m.call(solutionManager, "setReputationManagerAddress", [reputationManager], {
      id: "setReputationManagerOnSolutionManager",
    });
    m.call(solutionManager, "setRoleManagerAddress", [roleManager], {
      id: "setRoleManagerOnSolutionManager",
    });

    // Configure ChallengeCostManager dependencies
    m.call(challengeCostManager, "setChallengeManagerAddress", [challengeManager], {
      id: "setChallengeManagerOnChallengeCostManager",
    });
    m.call(challengeCostManager, "setModerationEscrowAddress", [moderationEscrow], {
      id: "setModerationEscrowOnChallengeCostManager",
    });

    // Configure ModerationEscrow dependencies
    m.call(moderationEscrow, "setChallengeManagerAddress", [challengeManager], {
      id: "setChallengeManagerOnModerationEscrow",
    });
    m.call(moderationEscrow, "setReputationManagerAddress", [reputationManager], {
      id: "setReputationManagerOnModerationEscrow",
    });

    // Configure recruitment-related dependencies
    m.call(recruiterSubscription, "setReputationManagerAddress", [reputationManager], {
      id: "setReputationManagerOnRecruiterSubscription",
    });
    
    m.call(recruiterDataManager, "setRecruiterSubscriptionAddress", [recruiterSubscription], {
      id: "setRecruiterSubscriptionOnRecruiterDataManager",
    });
    
    m.call(jobManager, "setRecruiterSubscriptionAddress", [recruiterSubscription], {
      id: "setRecruiterSubscriptionOnJobManager",
    });
    
    m.call(jobApplicationManager, "setJobManagerAddress", [jobManager], {
      id: "setJobManagerOnJobApplicationManager",
    });
    m.call(jobApplicationManager, "setRecruiterSubscriptionAddress", [recruiterSubscription], {
      id: "setRecruiterSubscriptionOnJobApplicationManager",
    });
    
    m.call(meetingManager, "setRecruiterSubscriptionAddress", [recruiterSubscription], {
      id: "setRecruiterSubscriptionOnMeetingManager",
    });

    // Grant roles and permissions
    m.call(reputationManager, "grantReputationUpdaterRole", [challengeManager], {
      id: "grantReputationUpdaterToChallengeManager",
    });
    m.call(reputationManager, "grantReputationUpdaterRole", [solutionManager], {
      id: "grantReputationUpdaterToSolutionManager",
    });

    m.call(challengeCostManager, "grantChallengeManagerRole", [challengeManager], {
      id: "grantChallengeManagerRoleOnChallengeCostManager",
    });

    m.call(moderationEscrow, "grantChallengeManagerRole", [challengeManager], {
      id: "grantChallengeManagerRoleOnModerationEscrow",
    });

    m.call(recruiterSubscription, "grantJobApplicationManagerRole", [jobApplicationManager], {
      id: "grantJobApplicationManagerRoleOnRecruiterSubscription",
    });

    return {
      reputationManager,
      roleManager,
      challengeManager,
      solutionManager,
      challengeCostManager,
      moderationEscrow,
      recruiterSubscription,
      recruiterDataManager,
      jobManager,
      jobApplicationManager,
      meetingManager,
    };
  }
);

export default PhaseTwoAddressConfigurationModule;
