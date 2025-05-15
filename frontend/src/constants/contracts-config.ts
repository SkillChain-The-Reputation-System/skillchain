import ChallengeManagerArtifact from "./contract-artifacts/ChallengeManager.json";
import SolutionManagerArtifact from "./contract-artifacts/SolutionManager.json";
import UserDataManagerArtifact from "./contract-artifacts/UserDataManager.json";
import ReputationManagerArtifact from "./contract-artifacts/ReputationManager.json";


export const ContractConfig_ChallengeManager = {
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Change this every time you deploy the contract
    abi: ChallengeManagerArtifact.abi,
};

export const ContractConfig_ReputationManager = {
    address: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707', // Change this every time you deploy the contract
    abi: ReputationManagerArtifact.abi,
};

export const ContractConfig_SolutionManager = {
    address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', // Change this every time you deploy the contract
    abi: SolutionManagerArtifact.abi,
};

export const ContractConfig_UserDataManager = {
    address: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853', // Change this every time you deploy the contract
    abi: UserDataManagerArtifact.abi,
};