import { RecruiterProfileInterface } from "@/lib/interfaces";

/**
 * Mock function to get recruiter profile data
 * @param address - The recruiter's wallet address
 * @returns Promise<RecruiterProfileInterface | null> - Recruiter profile data or null if not found
 */
export const getRecruiterProfileData = async (
  address: `0x${string}`
): Promise<RecruiterProfileInterface | null> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock recruiter data - in real implementation this would fetch from blockchain/Irys
    const mockRecruiterProfile: RecruiterProfileInterface = {
      address: address,
      fullname: "John Doe",
      company: "TechCorp Inc.",
      position: "Senior Technical Recruiter",
      email: "john.doe@techcorp.com",
      avatar_url: "https://github.com/shadcn.png",
      bio: "Experienced technical recruiter specializing in blockchain and web3 talent acquisition.",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      website: "https://techcorp.com",
      industry: "Blockchain & Web3",
      companySize: "51-200 employees"
    };

    return mockRecruiterProfile;
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
    
    if (!recruiterProfile || !recruiterProfile.avatar_url) {
      console.log(`No avatar URL found for recruiter ${address}`);
      return null;
    }

    return recruiterProfile.avatar_url;
  } catch (error) {
    console.error("Error fetching recruiter avatar URL:", error);
    return null;
  }
};

/**
 * Mock function to check if a recruiter is registered in the system
 * @param address - The recruiter's wallet address
 * @returns Promise<boolean> - True if recruiter is registered, false otherwise
 */
export const isRecruiterRegistered = async (
  address: `0x${string}`
): Promise<boolean> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock logic - assume all recruiters are registered for now
    return true;
  } catch (error) {
    console.error("Error checking recruiter registration status:", error);
    return false;
  }
};
