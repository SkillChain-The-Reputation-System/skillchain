import { readContract } from "@wagmi/core";
import { ContractConfig_RecruiterSubscription } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";

/**
 * Check if a user has the recruiter role by verifying their subscription status
 * @param address - The user's wallet address
 * @returns Promise<boolean> - True if user has recruiter role, false otherwise
 */
export const isUserRecruiter = async (
  address: `0x${string}`
): Promise<boolean> => {
  try {
    const isRecruiter = await readContract(wagmiConfig, {
      address: ContractConfig_RecruiterSubscription.address as `0x${string}`,
      abi: ContractConfig_RecruiterSubscription.abi,
      functionName: "isRecruiter",
      args: [address],
    }) as boolean;

    return isRecruiter;
  } catch (error) {
    console.error("Error checking recruiter status:", error);
    return false;
  }
};

/**
 * Get a user's budget balance from the recruiter subscription contract
 * @param address - The user's wallet address
 * @returns Promise<bigint | null> - The user's budget balance or null if error
 */
export const getRecruiterBudget = async (
  address: `0x${string}`
): Promise<bigint | null> => {
  try {
    const budget = await readContract(wagmiConfig, {
      address: ContractConfig_RecruiterSubscription.address as `0x${string}`,
      abi: ContractConfig_RecruiterSubscription.abi,
      functionName: "getBudget",
      args: [address],
    }) as bigint;

    return budget;
  } catch (error) {
    console.error("Error fetching recruiter budget:", error);
    return null;
  }
};

/**
 * Get the minimum budget required to be a recruiter from the smart contract
 * @returns Promise<bigint | null> - The minimum budget required or null if error
 */
export const getMinimumRecruiterBudget = async (): Promise<bigint | null> => {
  try {
    const minimumBudget = await readContract(wagmiConfig, {
      address: ContractConfig_RecruiterSubscription.address as `0x${string}`,
      abi: ContractConfig_RecruiterSubscription.abi,
      functionName: "getMinimumBudget",
      args: [],
    }) as bigint;

    return minimumBudget;
  } catch (error) {
    console.error("Error fetching minimum recruiter budget:", error);
    return null;
  }
};

/**
 * Get recruiter subscription status including role and budget information
 * @param address - The user's wallet address
 * @returns Promise<{isRecruiter: boolean, budget: bigint | null}> - Subscription status
 */
export const getRecruiterSubscriptionStatus = async (
  address: `0x${string}`
): Promise<{
  isRecruiter: boolean;
  budget: bigint | null;
}> => {
  try {
    const [isRecruiter, budget] = await Promise.all([
      isUserRecruiter(address),
      getRecruiterBudget(address),
    ]);

    return {
      isRecruiter,
      budget,
    };
  } catch (error) {
    console.error("Error fetching recruiter subscription status:", error);
    return {
      isRecruiter: false,
      budget: null,
    };
  }
};

/**
 * PaymentRecord interface matching the smart contract struct
 */
export interface PaymentRecord {
  timestamp: bigint;
  recruiter: string;
  applicant: string;
  amount: bigint;
  recordId: string;
}

/**
 * Get payment history for a recruiter
 * @param address - The recruiter's wallet address
 * @returns Promise<PaymentRecord[] | null> - Array of payment records or null if error
 */
export const getRecruiterPaymentHistory = async (
  address: `0x${string}`
): Promise<PaymentRecord[] | null> => {
  try {
    const paymentHistory = await readContract(wagmiConfig, {
      address: ContractConfig_RecruiterSubscription.address as `0x${string}`,
      abi: ContractConfig_RecruiterSubscription.abi,
      functionName: "getPaymentHistory",
      args: [address],
    }) as PaymentRecord[];

    return paymentHistory;
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return null;
  }
};

/**
 * Get the total number of payments made by a recruiter
 * @param address - The recruiter's wallet address
 * @returns Promise<bigint | null> - Total payment count or null if error
 */
export const getRecruiterPaymentCount = async (
  address: `0x${string}`
): Promise<bigint | null> => {
  try {
    const paymentCount = await readContract(wagmiConfig, {
      address: ContractConfig_RecruiterSubscription.address as `0x${string}`,
      abi: ContractConfig_RecruiterSubscription.abi,
      functionName: "getPaymentCount",
      args: [address],
    }) as bigint;

    return paymentCount;
  } catch (error) {
    console.error("Error fetching payment count:", error);
    return null;
  }
};

/**
 * Get the total amount spent by a recruiter
 * @param address - The recruiter's wallet address
 * @returns Promise<bigint | null> - Total amount spent or null if error
 */
export const getTotalPaymentsByRecruiter = async (
  address: `0x${string}`
): Promise<bigint | null> => {
  try {
    const totalPayments = await readContract(wagmiConfig, {
      address: ContractConfig_RecruiterSubscription.address as `0x${string}`,
      abi: ContractConfig_RecruiterSubscription.abi,
      functionName: "getTotalPaymentsByRecruiter",
      args: [address],
    }) as bigint;

    return totalPayments;
  } catch (error) {
    console.error("Error fetching total payments:", error);
    return null;
  }
};

/**
 * Get comprehensive recruiter data including budget, status, and payment history
 * @param address - The recruiter's wallet address
 * @returns Promise<RecruiterData> - Complete recruiter information
 */
export interface RecruiterData {
  isRecruiter: boolean;
  budget: bigint | null;
  minimumBudget: bigint | null;
  paymentHistory: PaymentRecord[] | null;
  paymentCount: bigint | null;
  totalPayments: bigint | null;
}

export const getComprehensiveRecruiterData = async (
  address: `0x${string}`
): Promise<RecruiterData> => {
  try {
    const [
      isRecruiter,
      budget,
      minimumBudget,
      paymentHistory,
      paymentCount,
      totalPayments,
    ] = await Promise.all([
      isUserRecruiter(address),
      getRecruiterBudget(address),
      getMinimumRecruiterBudget(),
      getRecruiterPaymentHistory(address),
      getRecruiterPaymentCount(address),
      getTotalPaymentsByRecruiter(address),
    ]);

    return {
      isRecruiter,
      budget,
      minimumBudget,
      paymentHistory,
      paymentCount,
      totalPayments,
    };
  } catch (error) {
    console.error("Error fetching comprehensive recruiter data:", error);
    return {
      isRecruiter: false,
      budget: null,
      minimumBudget: null,
      paymentHistory: null,
      paymentCount: null,
      totalPayments: null,
    };
  }
};