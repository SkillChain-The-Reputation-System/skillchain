import { readContract } from "@wagmi/core";
import { ContractConfig_UserDataManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import { UserProfileInterface } from "@/lib/interfaces";
import { fetchJsonDataOffChain } from "@/lib/fetching-offchain-data-utils";

/**
 * Get user's data ID from the smart contract
 * @param address - The user's wallet address
 * @returns Promise<string | null> - User's data ID or null if not found
 */
export const getUserDataId = async (
  address: `0x${string}`
): Promise<string | null> => {
  try {
    const userDataId = await readContract(wagmiConfig, {
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: "getUserDataId",
      args: [address],
    }) as string;

    if (!userDataId || userDataId.trim() === "") {
      console.log(`No data ID found for user ${address}`);
      return null;
    }

    return userDataId;
  } catch (error) {
    console.error("Error fetching user data ID:", error);
    return null;
  }
};

/**
 * Get user profile data from blockchain and Irys storage
 * @param address - The user's wallet address
 * @returns Promise<UserProfileInterface | null> - User profile data or null if not found
 */
export const getUserProfileData = async (
  address: `0x${string}`
): Promise<UserProfileInterface | null> => {
  try {
    // Step 1: Get the user data ID from the smart contract
    const userDataId = await getUserDataId(address);

    if (!userDataId) {
      return null;
    }

    // Step 2: Fetch the user profile data from Irys using the data ID
    const profileData: UserProfileInterface = await fetchJsonDataOffChain(
      `https://gateway.irys.xyz/mutable/${userDataId}`
    );

    if (!profileData) {
      console.log(`No profile data found on Irys for data ID: ${userDataId}`);
      return null;
    }

    // Step 3: Map the fetched data to UserProfileInterface
    const userProfile: UserProfileInterface = {
      address: address,
      fullname: profileData.fullname,
      location: profileData.location,
      email: profileData.email,
      avatar_url: profileData.avatar_url,
      bio: profileData.bio,
    };

    return userProfile;
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    return null;
  }
};

/**
 * Get user's image URL (avatar)
 * @param address - The user's wallet address
 * @returns Promise<string | null> - User's image URL or null if not found
 */
export const getUserAvatarUrl = async (
  address: `0x${string}`
): Promise<string | null> => {
  try {
    // Get the user profile data which contains the avatar_url
    const userProfile = await getUserProfileData(address);

    if (!userProfile || !userProfile.avatar_url) {
      console.log(`No image URL found for user ${address}`);
      return null;
    }

    return userProfile.avatar_url;
  } catch (error) {
    console.error("Error fetching user image URL:", error);
    return null;
  }
};

/**
 * Check if a user is registered in the system
 * @param address - The user's wallet address
 * @returns Promise<boolean> - True if user is registered, false otherwise
 */
export const isUserRegistered = async (
  address: `0x${string}`
): Promise<boolean> => {
  try {
    const isRegistered = await readContract(wagmiConfig, {
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: "isUserRegistered",
      args: [address],
    }) as boolean;

    return isRegistered;
  } catch (error) {
    console.error("Error checking user registration status:", error);
    return false;
  }
};

/**
 * Get a user's name by wallet address
 * @param address - The user's wallet address
 * @returns Promise<string> - The user's name or the address if not available
 */
export const getUserNameByAddress = async (
  address: `0x${string}`
): Promise<string> => {
  try {
    const registered = await isUserRegistered(address);
    if (!registered) {
      return address;
    }

    const profile = await getUserProfileData(address);
    const fullname = profile?.fullname ?? "";

    if (fullname.trim() === "") {
      return address;
    }

    return fullname;
  } catch (_error) {
    return address;
  }
};



