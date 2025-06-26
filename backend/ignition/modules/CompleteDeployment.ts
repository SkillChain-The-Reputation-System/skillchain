import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import LibrariesModule from "./Libraries";
import UserDataManagerModule from "./UserDataManager";
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
import PhaseTwoAddressConfigurationModule from "./PhaseTwo_AddressConfiguration";

/**
 * Complete Deployment Module
 * 
 * This module implements a two-phase deployment strategy to resolve circular dependencies:
 * 
 * Phase 1: Deploy all contracts with their libraries but without cross-references
 * Phase 2: Configure all address dependencies and grant roles
 */
const CompleteDeploymentModule = buildModule("CompleteDeploymentModule", (m) => {
  // Phase 1: Libraries and independent contracts
  const libraries = m.useModule(LibrariesModule);
  const { userDataManager } = m.useModule(UserDataManagerModule);
  
  // Phase 1: Core contracts (deployed without dependencies)
  const { reputationManager } = m.useModule(ReputationManagerModule);
  const { roleManager } = m.useModule(RoleManagerModule);
  const { challengeManager } = m.useModule(ChallengeManagerModule);
  const { solutionManager } = m.useModule(SolutionManagerModule);
  const { challengeCostManager } = m.useModule(ChallengeCostManagerModule);
  const { moderationEscrow } = m.useModule(ModerationEscrowModule);
  
  // Phase 1: Recruitment and job management contracts
  const { recruiterSubscription } = m.useModule(RecruiterSubscriptionModule);
  const { recruiterDataManager } = m.useModule(RecruiterDataManagerModule);
  const { jobManager } = m.useModule(JobManagerModule);
  const { jobApplicationManager } = m.useModule(JobApplicationManagerModule);
  const { meetingManager } = m.useModule(MeetingManagerModule);

  // Phase 2: Configure all address dependencies and roles
  const phaseTwo = m.useModule(PhaseTwoAddressConfigurationModule);

  return {
    // Libraries
    ...libraries,
    
    // Core contracts
    userDataManager,
    
    // Phase 2 returns all configured contracts (includes recruitment contracts)
    ...phaseTwo,
  };
});

export default CompleteDeploymentModule;
