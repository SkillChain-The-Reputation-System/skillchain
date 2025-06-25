import ChallengeManagerArtifact from "./contract-artifacts/ChallengeManager.json";
import RoleManagerArtifact from "./contract-artifacts/RoleManager.json";
import SolutionManagerArtifact from "./contract-artifacts/SolutionManager.json";
import ChallengeCostManagerArtifact from "./contract-artifacts/ChallengeCostManager.json";
import ModerationEscrowArtifact from "./contract-artifacts/ModerationEscrow.json";
import ReputationManagerArtifact from "./contract-artifacts/ReputationManager.json";
import JobApplicationManagerArtifact from "./contract-artifacts/JobApplicationManager.json";
import JobManagerArtifact from "./contract-artifacts/JobManager.json";
import RecruiterSubscriptionArtifact from "./contract-artifacts/RecruiterSubscription.json";
import MeetingManagerArtifact from "./contract-artifacts/MeetingManager.json";
import RecruiterDataManagerArtifact from "./contract-artifacts/RecruiterDataManager.json";
import UserDataManagerArtifact from "./contract-artifacts/UserDataManager.json";

// Network detection helper
const isProduction = process.env.NODE_ENV === 'production';
const useAmoyNetwork = isProduction || process.env.NEXT_PUBLIC_USE_AMOY === 'true';

// Contract addresses for different networks
const LOCALHOST_ADDRESSES = {
  ChallengeManager: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  RoleManager: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  SolutionManager: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  ChallengeCostManager: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  ModerationEscrow: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
  ReputationManager: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
  JobApplicationManager: '0x67d269191c92Caf3cD7723F116c85e6E9bf55933',
  JobManager: '0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E',
  RecruiterSubscription: '0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690',
  MeetingManager: '0xf5059a5D33d5853360D16C683c16e67980206f36',
  RecruiterDataManager: '0x998abeb3E57409262aE5b751f60747921B33613E',
  UserDataManager: '0x4826533B4897376654Bb4d4AD88B7faFD0C98528',
};

const AMOY_ADDRESSES = {
  ChallengeManager: '0x6a2a3359F39fc3966E707cc6cA9a36e69097e9Ce',
  RoleManager: '0x6De40aB2abE8A28A7b7DfCEb31F25C576747EFDb',
  SolutionManager: '0x1f1eDC8bCb08d3CabA55eCb1e96c0B6E1F3fb974',
  ChallengeCostManager: '0xd315cb12dD8747a06dE31156aFa27a51ab6fc069',
  ModerationEscrow: '0xE08b267a0AE6a81345c0158F5D3dd96282Cb085F',
  ReputationManager: '0xDCCCFEde9529451fC3fe50C3759424b5379489d2',
  JobApplicationManager: '0xfB57866Ef6c0B6F4e05B14641a4892aE97844DeB',
  JobManager: '0x81967C7b28B7d557A2538296DAeD17d90Ca8A5ee',
  RecruiterSubscription: '0x07F798FEdc2A02EBe3ABE7A6dd51a8e8A81A9AD4',
  MeetingManager: '0xB1b3f6D4B0c2CC2BC268Bf47167c848b24fF1FAD',
  RecruiterDataManager: '0x354cf5c1ad191d95da4fA489Fd2D701688A6cfec',
  UserDataManager: '0xCB769c0136D87d0462aEe90bbfb29724206CDD74',
};

// Helper function to get the correct address based on network
const getContractAddress = (contractName: keyof typeof LOCALHOST_ADDRESSES): string => {
  const addresses = useAmoyNetwork ? AMOY_ADDRESSES : LOCALHOST_ADDRESSES;
  const address = addresses[contractName];
  
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    console.warn(`⚠️  No address found for ${contractName} on ${useAmoyNetwork ? 'Amoy' : 'localhost'} network`);
  }
  
  return address;
};

export const ContractConfig_ChallengeManager = {
  get address() {
    return getContractAddress('ChallengeManager');
  },
  abi: ChallengeManagerArtifact.abi,
};

export const ContractConfig_RoleManager = {
  get address() {
    return getContractAddress('RoleManager');
  },
  abi: RoleManagerArtifact.abi,
};

export const ContractConfig_SolutionManager = {
  get address() {
    return getContractAddress('SolutionManager');
  },
  abi: SolutionManagerArtifact.abi,
};

export const ContractConfig_ChallengeCostManager = {
  get address() {
    return getContractAddress('ChallengeCostManager');
  },
  abi: ChallengeCostManagerArtifact.abi,
};

export const ContractConfig_ModerationEscrow = {
  get address() {
    return getContractAddress('ModerationEscrow');
  },
  abi: ModerationEscrowArtifact.abi,
};

export const ContractConfig_ReputationManager = {
  get address() {
    return getContractAddress('ReputationManager');
  },
  abi: ReputationManagerArtifact.abi,
};

export const ContractConfig_JobApplicationManager = {
  get address() {
    return getContractAddress('JobApplicationManager');
  },
  abi: JobApplicationManagerArtifact.abi,
};

export const ContractConfig_JobManager = {
  get address() {
    return getContractAddress('JobManager');
  },
  abi: JobManagerArtifact.abi,
};

export const ContractConfig_RecruiterSubscription = {
  get address() {
    return getContractAddress('RecruiterSubscription');
  },
  abi: RecruiterSubscriptionArtifact.abi,
};

export const ContractConfig_MeetingManager = {
  get address() {
    return getContractAddress('MeetingManager');
  },
  abi: MeetingManagerArtifact.abi,
};

export const ContractConfig_RecruiterDataManager = {
  get address() {
    return getContractAddress('RecruiterDataManager');
  },
  abi: RecruiterDataManagerArtifact.abi,
};

export const ContractConfig_UserDataManager = {
  get address() {
    return getContractAddress('UserDataManager');
  },
  abi: UserDataManagerArtifact.abi,
};

// Network information
export const NETWORK_INFO = {
  useAmoyNetwork,
  isProduction,
  currentNetwork: useAmoyNetwork ? 'Polygon Amoy (Chain ID: 80002)' : 'Localhost Hardhat (Chain ID: 31337)',
  localhostAddresses: LOCALHOST_ADDRESSES,
  amoyAddresses: AMOY_ADDRESSES,
};
