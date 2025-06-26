import WeightsArtifact from "./contract-artifacts/Weights.json";
import ChallengeCostFormulasArtifact from "./contract-artifacts/ChallengeCostFormulas.json";
import RewardTokenFormulasArtifact from "./contract-artifacts/RewardTokenFormulas.json";
import RecruitmentFeeFormulasArtifact from "./contract-artifacts/RecruitmentFeeFormulas.json";
import ReputationFormulasArtifact from "./contract-artifacts/ReputationFormulas.json";
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
  Weights: '0x0000000000000000000000000000000000000000',
  ChallengeCostFormulas: '0x0000000000000000000000000000000000000000',
  RewardTokenFormulas: '0x0000000000000000000000000000000000000000',
  RecruitmentFeeFormulas: '0x0000000000000000000000000000000000000000',
  ReputationFormulas: '0x0000000000000000000000000000000000000000',
  UserDataManager: '0x0000000000000000000000000000000000000000',
  ReputationManager: '0x0000000000000000000000000000000000000000',
  RoleManager: '0x0000000000000000000000000000000000000000',
  ChallengeManager: '0x0000000000000000000000000000000000000000',
  SolutionManager: '0x0000000000000000000000000000000000000000',
  ChallengeCostManager: '0x0000000000000000000000000000000000000000',
  ModerationEscrow: '0x0000000000000000000000000000000000000000',
  RecruiterSubscription: '0x0000000000000000000000000000000000000000',
  RecruiterDataManager: '0x0000000000000000000000000000000000000000',
  JobManager: '0x0000000000000000000000000000000000000000',
  JobApplicationManager: '0x0000000000000000000000000000000000000000',
  MeetingManager: '0x0000000000000000000000000000000000000000',
};

const AMOY_ADDRESSES = {
  Weights: '0xE84c649075e54C23C61C40077e5378Da30d9DAf3',
  ChallengeCostFormulas: '0xcb812bcA89d2697065d76De6aD2583F35Fda0726',
  RewardTokenFormulas: '0xa9620C71D04B5cACc27aaaddd9BA61A89209E659',
  RecruitmentFeeFormulas: '0xB349AE5360c866384653F27348aA22F2E578E6aD',
  ReputationFormulas: '0xea6A0788CcA990aB866Efe88C05923DB8fE539de',
  UserDataManager: '0x02D14510143dde8bE8922D1d50ceD3e0259113A9',
  ReputationManager: '0xDBB645a0d9a863d493d06439302a0CdE4Fb92d9b',
  RoleManager: '0x774A3ce1C4f09a46617B4A804C85672628e9C47A',
  ChallengeManager: '0x781383A981aC2eE93d0dc4F371eE72bA4Bd06546',
  SolutionManager: '0x867c447E05001B7D9a3D514Ef62830507cf3A80d',
  ChallengeCostManager: '0xc6BeBE603D5da86F6393AC38204a25A1a161d771',
  ModerationEscrow: '0x7EcFbee4604dF5B8d92cBf0187A4a3F1c6f5Ed30',
  RecruiterSubscription: '0x2c646C31a784C702Efaf6866c5f3737e23C36890',
  RecruiterDataManager: '0x7b7Eb62Bfc90097A53E24Ea5A66C84919fa477c0',
  JobManager: '0xe7F47aFa1004A0d08495c71FEd41008De06f70F9',
  JobApplicationManager: '0xD6Cb373eCa511FCC2fEd3203Ef0693e11227b510',
  MeetingManager: '0x52cb8d6adB691B9Fc61144594d500C1751f979a1',
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

export const ContractConfig_Weights = {
  get address() {
    return getContractAddress('Weights');
  },
  abi: WeightsArtifact.abi,
};

export const ContractConfig_ChallengeCostFormulas = {
  get address() {
    return getContractAddress('ChallengeCostFormulas');
  },
  abi: ChallengeCostFormulasArtifact.abi,
};

export const ContractConfig_RewardTokenFormulas = {
  get address() {
    return getContractAddress('RewardTokenFormulas');
  },
  abi: RewardTokenFormulasArtifact.abi,
};

export const ContractConfig_RecruitmentFeeFormulas = {
  get address() {
    return getContractAddress('RecruitmentFeeFormulas');
  },
  abi: RecruitmentFeeFormulasArtifact.abi,
};

export const ContractConfig_ReputationFormulas = {
  get address() {
    return getContractAddress('ReputationFormulas');
  },
  abi: ReputationFormulasArtifact.abi,
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
