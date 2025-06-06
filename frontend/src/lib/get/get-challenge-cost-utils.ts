import { readContract } from "@wagmi/core";
import { formatEther } from "viem";
import { ContractConfig_ChallengeCostManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";

/**
 * Get the cost for joining a specific challenge from the ChallengeCostManager contract
 * @param challengeId The ID of the challenge to get the cost for
 * @returns The cost amount in ETH as a number
 */
export const getChallengeCost = async (challengeId: number): Promise<number> => {
  const costInWei = (await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeCostManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeCostManager.abi,
    functionName: "getCost",
    args: [challengeId],
  })) as bigint;

  // Convert from wei to ETH
  return parseFloat(formatEther(costInWei));
};