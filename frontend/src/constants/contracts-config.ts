import ChallengeManagerArtifact from "./contract-artifacts/ChallengeManager.json";
import SolutionManagerArtifact from "./contract-artifacts/SolutionManager.json";
import UserDataManagerArtifact from "./contract-artifacts/UserDataManager.json";
import ReputationManagerArtifact from "./contract-artifacts/ReputationManager.json";


export const ContractConfig_ChallengeManager = {
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Change this every time you deploy the contract
    abi: ChallengeManagerArtifact.abi,
};

export const ContractConfig_ReputationManager = {
    address: '0x0165878A594ca255338adfa4d48449f69242Eb8F', // Change this every time you deploy the contract
    abi: ReputationManagerArtifact.abi,
};

export const ContractConfig_SolutionManager = {
    address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', // Change this every time you deploy the contract
    abi: SolutionManagerArtifact.abi,
};

export const ContractConfig_UserDataManager = {
    address: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318', // Change this every time you deploy the contract
    abi: UserDataManagerArtifact.abi,
};