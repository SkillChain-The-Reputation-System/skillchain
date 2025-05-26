import { readContract } from "@wagmi/core";
import { ContractConfig_ReputationManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import { Domain } from "@/constants/system";
import { UserReputationScoreInterface } from "@/lib/interfaces";

/**
 * Get user reputation scores from the blockchain
 * @param address - The user's wallet address
 * @returns UserReputationScoreInterface with global and domain-specific reputation scores
 */
export const getUserReputationScore = async (
  address: `0x${string}`
): Promise<UserReputationScoreInterface> => {
  try {
    // Get global reputation from the contract
    const global_reputation = (await readContract(wagmiConfig, {
      address: ContractConfig_ReputationManager.address as `0x${string}`,
      abi: ContractConfig_ReputationManager.abi,
      functionName: "getGlobalReputation",
      args: [address],
    })) as number | bigint;

    // Get all domain reputations from the contract (returns array of 14 scores)
    const domain_reputation_array = (await readContract(wagmiConfig, {
      address: ContractConfig_ReputationManager.address as `0x${string}`,
      abi: ContractConfig_ReputationManager.abi,
      functionName: "getAllDomainReputation",
      args: [address],
    })) as number[] | bigint[];

    // Convert the array to a Record<Domain, number> as required by the interface
    const domain_reputation: Record<Domain, number> = {} as Record<Domain, number>;
    
    // Map each domain index to its corresponding reputation score
    for (let i = 0; i < 14; i++) {
      domain_reputation[i as Domain] = Number(domain_reputation_array[i]);
    }

    return {
      global_reputation: Number(global_reputation),
      domain_reputation: domain_reputation,
    };
  } catch (error) {
    console.error("Error fetching user reputation score:", error);
    throw error;
  }
};