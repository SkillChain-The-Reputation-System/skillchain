# Two-Phase Deployment Documentation

## Overview

This project now uses a **two-phase deployment strategy** to resolve circular dependencies between smart contracts. The deployment is structured to avoid the circular dependency issues that were present in the original deployment scripts.

## Problem Solved

### Original Circular Dependencies
- **RoleManager ↔ ReputationManager**: Both contracts needed each other's addresses
- **ChallengeManager ↔ ChallengeCostManager**: Complex circular dependencies 
- **ChallengeManager ↔ ModerationEscrow**: Cross-referencing during deployment
- **Multiple contract interdependencies**: Created a complex web of dependencies

## Two-Phase Solution

### Phase 1: Contract Deployment
All contracts are deployed **without** setting cross-references:
- Libraries are deployed first (no dependencies)
- Core contracts are deployed with only library dependencies
- No address setting or role granting occurs

### Phase 2: Address Configuration
After all contracts are deployed, addresses are configured:
- Set all contract addresses on dependent contracts
- Grant necessary roles and permissions
- Configure the complete contract ecosystem

## Deployment Structure

```
Libraries (Independent)
├── Weights
├── RewardTokenFormulas  
├── ChallengeCostFormulas
├── RecruitmentFeeFormulas
└── ReputationFormulas

Phase 1 Contracts (Independent deployment)
├── UserDataManager
├── ReputationManager (with ReputationFormulas library)
├── RoleManager
├── ChallengeManager
├── SolutionManager
├── ChallengeCostManager (with libraries)
├── ModerationEscrow (with RewardTokenFormulas library)
├── RecruiterSubscription (with RecruitmentFeeFormulas library)
├── RecruiterDataManager
├── JobManager
├── JobApplicationManager
└── MeetingManager

Phase 2 Configuration
└── PhaseTwoAddressConfiguration (Sets all addresses and roles)
```

## Key Files

### Core Deployment Modules
- `MainDeployment.ts` - Main entry point for deployment
- `CompleteDeployment.ts` - Orchestrates the complete two-phase deployment
- `PhaseTwo_AddressConfiguration.ts` - Handles all address setting and role granting

### Individual Contract Modules (Phase 1)
All individual contract modules now deploy contracts without cross-dependencies:
- `RoleManager.ts` - Deploys RoleManager only
- `ReputationManager.ts` - Deploys ReputationManager with libraries
- `ChallengeManager.ts` - Deploys ChallengeManager only
- etc.

## Usage

### Deploy All Contracts
```bash
npx hardhat ignition deploy ignition/modules/MainDeployment.ts --network <network>
```

### Deploy Individual Phases (for testing)
```bash
# Phase 1 only - deploy contracts without configuration
npx hardhat ignition deploy ignition/modules/ReputationManager.ts --network <network>

# Phase 2 only - configure addresses (requires Phase 1 to be complete)
npx hardhat ignition deploy ignition/modules/PhaseTwo_AddressConfiguration.ts --network <network>
```

## Benefits

1. **No Circular Dependencies**: Clean deployment order without dependency conflicts
2. **Modular**: Each contract can be deployed and tested independently
3. **Predictable**: Clear two-phase process is easy to understand and debug
4. **Maintainable**: Easy to add new contracts or modify dependencies
5. **Flexible**: Can deploy subsets of contracts for testing

## Address Configuration Details

The Phase 2 configuration handles:

### Core System Dependencies
- RoleManager ↔ ReputationManager mutual address setting
- ChallengeManager receives: ReputationManager, SolutionManager, RoleManager, ChallengeCostManager, ModerationEscrow
- SolutionManager receives: ChallengeManager, ReputationManager, RoleManager
- ChallengeCostManager receives: ChallengeManager, ModerationEscrow
- ModerationEscrow receives: ChallengeManager, ReputationManager

### Recruitment System Dependencies  
- RecruiterSubscription receives: ReputationManager
- JobManager receives: RecruiterSubscription
- JobApplicationManager receives: JobManager, RecruiterSubscription
- RecruiterDataManager receives: RecruiterSubscription
- MeetingManager receives: RecruiterSubscription

### Role Grants
- ReputationManager grants REPUTATION_UPDATER_ROLE to ChallengeManager and SolutionManager
- ChallengeCostManager grants CHALLENGE_MANAGER_ROLE to ChallengeManager
- ModerationEscrow grants CHALLENGE_MANAGER_ROLE to ChallengeManager
- RecruiterSubscription grants JOB_APPLICATION_MANAGER_ROLE to JobApplicationManager

## Migration from Old Deployment

If you were using the old deployment scripts, simply use `MainDeployment.ts` instead. The new system will deploy all contracts with the same functionality but without circular dependency issues.
