import UserDataManagerArtifact from "./contract-artifacts/UserDataManager.json";
import ReputationManagerArtifact from "./contract-artifacts/ReputationManager.json";
import RoleManagerArtifact from "./contract-artifacts/RoleManager.json";
import ChallengeManagerArtifact from "./contract-artifacts/ChallengeManager.json";
import SolutionManagerArtifact from "./contract-artifacts/SolutionManager.json";
import ChallengeCostManagerArtifact from "./contract-artifacts/ChallengeCostManager.json";
import ModerationEscrowArtifact from "./contract-artifacts/ModerationEscrow.json";
import RecruiterSubscriptionArtifact from "./contract-artifacts/RecruiterSubscription.json";
import RecruiterDataManagerArtifact from "./contract-artifacts/RecruiterDataManager.json";
import JobManagerArtifact from "./contract-artifacts/JobManager.json";
import JobApplicationManagerArtifact from "./contract-artifacts/JobApplicationManager.json";
import MeetingManagerArtifact from "./contract-artifacts/MeetingManager.json";

// Network detection helper
const isProduction = process.env.NODE_ENV === 'production';
const useAmoyNetwork = isProduction || process.env.NEXT_PUBLIC_USE_AMOY === 'true';

// Contract addresses for different networks
const LOCALHOST_ADDRESSES = {
  UserDataManager: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  ReputationManager: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  RoleManager: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  ChallengeManager: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  SolutionManager: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
  ChallengeCostManager: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
  ModerationEscrow: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
  RecruiterSubscription: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
  RecruiterDataManager: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82',
  JobManager: '0x9A676e781A523b5d0C0e43731313A708CB607508',
  JobApplicationManager: '0x0B306BF915C4d645ff596e518fAf3F9669b97016',
  MeetingManager: '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1',
};

const AMOY_ADDRESSES = {
  UserDataManager: '0x92d831A0F692301054Fe7dA6E6f61b6FE759FfB0',
  ReputationManager: '0x05bBcb6EB812754bD795fe9b440787684B95BBFC',
  RoleManager: '0xD1128930ccB130428165233ac8FF5e212A27db4D',
  ChallengeManager: '0x1703C38747d1f92AB6359c13D198107A40d19940',
  SolutionManager: '0xCD097Fc428E1b6636A20abc3b32f051839E9cfFC',
  ChallengeCostManager: '0x105c04Da1d18A263251B6dBA7b0d0eD74F92f089',
  ModerationEscrow: '0xaCCccb46Ef8CDe21E19BAc7C7E7b724Eb909784A',
  RecruiterSubscription: '0xCD0715f548977DdF6e7bae6dA63E5d0811Ac2D03',
  RecruiterDataManager: '0x1b9f7374e4013664322A703B04fA226cB678Df85',
  JobManager: '0x810b3103cd52Ea4f3bEBb4Fe2a79c86418DC08F5',
  JobApplicationManager: '0x99f98339E1C4e923167d91458D197C2E46fcf177',
  MeetingManager: '0x55f473f1aa0e7441571763c619E7653ff57A839c',
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

export const ContractConfig_UserDataManager = {
  get address() {
    return getContractAddress('UserDataManager');
  },
  abi: UserDataManagerArtifact.abi,
};

export const ContractConfig_ReputationManager = {
  get address() {
    return getContractAddress('ReputationManager');
  },
  abi: ReputationManagerArtifact.abi,
};

export const ContractConfig_RoleManager = {
  get address() {
    return getContractAddress('RoleManager');
  },
  abi: RoleManagerArtifact.abi,
};

export const ContractConfig_ChallengeManager = {
  get address() {
    return getContractAddress('ChallengeManager');
  },
  abi: ChallengeManagerArtifact.abi,
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

export const ContractConfig_RecruiterSubscription = {
  get address() {
    return getContractAddress('RecruiterSubscription');
  },
  abi: RecruiterSubscriptionArtifact.abi,
};

export const ContractConfig_RecruiterDataManager = {
  get address() {
    return getContractAddress('RecruiterDataManager');
  },
  abi: RecruiterDataManagerArtifact.abi,
};

export const ContractConfig_JobManager = {
  get address() {
    return getContractAddress('JobManager');
  },
  abi: JobManagerArtifact.abi,
};

export const ContractConfig_JobApplicationManager = {
  get address() {
    return getContractAddress('JobApplicationManager');
  },
  abi: JobApplicationManagerArtifact.abi,
};

export const ContractConfig_MeetingManager = {
  get address() {
    return getContractAddress('MeetingManager');
  },
  abi: MeetingManagerArtifact.abi,
};

// Network information
export const NETWORK_INFO = {
  useAmoyNetwork,
  isProduction,
  currentNetwork: useAmoyNetwork ? 'Polygon Amoy (Chain ID: 80002)' : 'Localhost Hardhat (Chain ID: 31337)',
  localhostAddresses: LOCALHOST_ADDRESSES,
  amoyAddresses: AMOY_ADDRESSES,
};
