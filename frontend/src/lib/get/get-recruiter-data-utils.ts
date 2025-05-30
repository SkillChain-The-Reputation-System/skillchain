import { readContract } from "@wagmi/core";
import { ContractConfig_RecruiterDataManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import { RecruiterProfileInterface } from "@/lib/interfaces";
import { fetchJsonDataOffChain } from "@/lib/fetching-offchain-data-utils";


/**
 * Get the data ID of a recruiter with a created profile
 * @param address - The recruiter's wallet address
 * @returns Promise<string | null> - The data ID of the recruiter's profile or null if not found
 */
export const getRecruiterDataId = async (
  address: `0x${string}`
): Promise<string | null> => {
  try {
    const dataId = await readContract(wagmiConfig, {
      address: ContractConfig_RecruiterDataManager.address as `0x${string}`,
      abi: ContractConfig_RecruiterDataManager.abi,
      functionName: "getRecruiterDataId",
      args: [address],
    }) as string;

    return dataId;
  } catch (error) {
    console.error("Error fetching recruiter data ID:", error);
    return null;
  }
};


/**
 * Get recruiter profile data from blockchain and Irys storage
 * @param address - The recruiter's wallet address
 * @returns Promise<RecruiterProfileInterface | null> - Recruiter profile data or null if not found
 */
export const getRecruiterProfileData = async (
  address: `0x${string}`
): Promise<RecruiterProfileInterface | null> => {
  try {
    // Step 1: Get the recruiter data from the smart contract
    const recruiterData = await readContract(wagmiConfig, {
      address: ContractConfig_RecruiterDataManager.address as `0x${string}`,
      abi: ContractConfig_RecruiterDataManager.abi,
      functionName: "getRecruiter",
      args: [address],
    }) as { recruiter_address: string; data_id: string };

    if (!recruiterData || !recruiterData.data_id) {
      console.log(`No recruiter data found for address ${address}`);
      return null;
    }

    // Step 2: Fetch the recruiter profile data from Irys using the data_id
    const profileData: RecruiterProfileInterface = await fetchJsonDataOffChain(
      `https://gateway.irys.xyz/mutable/${recruiterData.data_id}`
    );

    if (!profileData) {
      console.log(`No profile data found on Irys for data ID: ${recruiterData.data_id}`);
      return null;
    }

    // Step 3: Map the fetched data to RecruiterProfileInterface
    const recruiterProfile: RecruiterProfileInterface = {
      recruiter_address: address,
      recruiter_fullname: profileData.recruiter_fullname,
      recruiter_email: profileData.recruiter_email,
      recruiter_phone: profileData.recruiter_phone,
      recruiter_position: profileData.recruiter_position,
      recruiter_bio: profileData.recruiter_bio,
      recruiter_avatar_url: profileData.recruiter_avatar_url,
      company_name: profileData.company_name,
      company_website: profileData.company_website,
      company_location: profileData.company_location,
      company_industry: profileData.company_industry,
      company_size: profileData.company_size,
      company_description: profileData.company_description,
    };

    return recruiterProfile;
  } catch (error) {
    console.error("Error fetching recruiter profile data:", error);
    return null;
  }
};

/**
 * Mock function to get recruiter's avatar URL
 * @param address - The recruiter's wallet address
 * @returns Promise<string | null> - Recruiter's avatar URL or null if not found
 */
export const getRecruiterAvatarUrl = async (
  address: `0x${string}`
): Promise<string | null> => {
  try {
    const recruiterProfile = await getRecruiterProfileData(address);
    
    if (!recruiterProfile || !recruiterProfile.recruiter_avatar_url) {
      console.log(`No avatar URL found for recruiter ${address}`);
      return null;
    }

    return recruiterProfile.recruiter_avatar_url;
  } catch (error) {
    console.error("Error fetching recruiter avatar URL:", error);
    return null;
  }
};




/**
 * Function to check if a recruiter profile is registered in the system
 * @param address - The recruiter's wallet address
 * @returns Promise<boolean> - True if recruiter is registered, false otherwise
 */
export const isRecruiterProfileRegistered = async (
  address: `0x${string}`
): Promise<boolean> => {
  try {
    const hasProfile = await readContract(wagmiConfig, {
      address: ContractConfig_RecruiterDataManager.address as `0x${string}`,
      abi: ContractConfig_RecruiterDataManager.abi,
      functionName: "hasRecruiterProfile",
      args: [address],
    }) as boolean;

    return hasProfile;
  } catch (error) {
    console.error("Error checking recruiter registration status:", error);
    return false;
  }
};

