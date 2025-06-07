import { readContract } from "@wagmi/core";
import { ContractConfig_RoleManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import { UserRoleStatusInterface, RoleRequirementsInterface } from "@/lib/interfaces";

/**
 * Get user's role status and eligibility from the RoleManager smart contract
 * @param address - The user's wallet address
 * @returns Promise<UserRoleStatusInterface> - User role status data including reputation, role eligibility and current roles
 */
export const getUserRoleStatus = async (
  address: `0x${string}`
): Promise<UserRoleStatusInterface> => {
  try {
    // Call getUserStatus function from RoleManager contract
    const result = await readContract(wagmiConfig, {
      address: ContractConfig_RoleManager.address as `0x${string}`,
      abi: ContractConfig_RoleManager.abi,
      functionName: "getUserStatus",
      args: [address],
    }) as [bigint, boolean, boolean, boolean, boolean, boolean, boolean];

    // Extract the values from the tuple response
    const [
      reputation,
      can_be_contributor,
      can_be_evaluator,
      can_be_moderator,
      is_contributor,
      is_evaluator,
      is_moderator
    ] = result;

    return {
      reputation: Number(reputation),
      can_be_contributor,
      can_be_evaluator,
      can_be_moderator,
      is_contributor,
      is_evaluator,
      is_moderator
    };
  } catch (error) {
    console.error("Error fetching user role status:", error);
    throw error;
  }
};

/**
 * Get all role requirements from the RoleManager smart contract
 * @returns Promise<RoleRequirementsInterface> - The minimum reputation requirements for all roles
 */
export const getAllRoleRequirements = async (): Promise<RoleRequirementsInterface> => {
  try {
    // Call getAllRoleRequirements function from RoleManager contract
    const result = await readContract(wagmiConfig, {
      address: ContractConfig_RoleManager.address as `0x${string}`,
      abi: ContractConfig_RoleManager.abi,
      functionName: "getAllRoleRequirements",
    }) as [bigint, bigint, bigint];

    // Extract the values from the tuple response
    const [
      contributor_requirement,
      evaluator_requirement,
      moderator_requirement
    ] = result;

    return {
      contributor_requirement: Number(contributor_requirement),
      evaluator_requirement: Number(evaluator_requirement),
      moderator_requirement: Number(moderator_requirement)
    };
  } catch (error) {
    console.error("Error fetching role requirements:", error);
    throw error;
  }
};