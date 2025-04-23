import UserDataManagerArtifact from "./contract-artifacts/UserDataManager.json";
import ChallengeManagerArtifact from "./contract-artifacts/ChallengeManager.json";

export const ContractConfig_UserDataManager = {
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Change this every time you deploy the contract
    abi: UserDataManagerArtifact.abi,
};

export const ContractConfig_ChallengeManager = {
    address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Change this every time you deploy the contract
    abi: ChallengeManagerArtifact.abi,
};