import { writeContract, simulateContract, waitForTransactionReceipt } from "@wagmi/core";
import { ContractConfig_RecruiterSubscription } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import { parseEther } from "viem";

/**
 * Deposit ETH to the recruiter's budget
 * @param amount - The amount of ETH to deposit (in ETH, not Wei)
 * @returns Promise with transaction result
 */
export const depositToRecruiterBudget = async (amount: string) => {
  try {
    // Convert the amount to Wei
    const amountInWei = parseEther(amount);

    // First simulate the contract call to check if it would succeed
    const { request } = await simulateContract(wagmiConfig, {
      address: ContractConfig_RecruiterSubscription.address as `0x${string}`,
      abi: ContractConfig_RecruiterSubscription.abi,
      functionName: "deposit",
      args: [],
      value: amountInWei,
    });

    // Execute the transaction
    const hash = await writeContract(wagmiConfig, request);

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
    });

    return receipt;
  } catch (error) {
    console.error("Error depositing to recruiter budget:", error);
    throw error;
  }
};

/**
 * Deposit a fixed amount of ETH to the recruiter's budget
 * @param amountInWei - The amount of ETH to deposit in Wei
 * @returns Promise with transaction result
 */
export const depositToRecruiterBudgetInWei = async (amountInWei: bigint) => {
  try {
    // First simulate the contract call to check if it would succeed
    const { request } = await simulateContract(wagmiConfig, {
      address: ContractConfig_RecruiterSubscription.address as `0x${string}`,
      abi: ContractConfig_RecruiterSubscription.abi,
      functionName: "deposit",
      args: [],
      value: amountInWei,
    });

    // Execute the transaction
    const hash = await writeContract(wagmiConfig, request);

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
    });

    return receipt;
  } catch (error) {
    console.error("Error depositing to recruiter budget:", error);
    throw error;
  }
};