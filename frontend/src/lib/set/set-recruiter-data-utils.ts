import { RecruiterFormValues } from "@/features/recruiter-account/settings/profile-company-info";
import { RecruiterProfileInterface, IrysUploadResponseInterface } from "@/lib/interfaces";
import {
  writeContract,
  simulateContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { ContractConfig_RecruiterDataManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import { getRecruiterDataId, getRecruiterProfileData } from "@/lib/get/get-recruiter-data-utils";
import axios from "axios";


export const updateRecruiterProfile = async (
  address: `0x${string}`,
  profileData: RecruiterFormValues
): Promise<string> => {
  try {
    // Step 1: Get the data_id from smart contract by calling getRecruiterDataId
    const data_id = await getRecruiterDataId(address);

    if (!data_id) {
      throw new Error("Recruiter is not registered or data_id not found");
    }

    // Step 2: Get current recruiter profile data to preserve existing avatar if no new one is provided
    const currentProfile = await getRecruiterProfileData(address);
    let avatar_url = currentProfile?.recruiter_avatar_url || "";

    // Step 3: Upload the recruiter_avatar image first if it exists
    if (profileData.recruiter_avatar) {
      console.log("Uploading recruiter avatar image to Irys...: ", profileData.recruiter_avatar);
      const { data: image_upload_response } =
        await axios.post<IrysUploadResponseInterface>(
          "/api/irys/upload/upload-file",
          profileData.recruiter_avatar
        );

      if (!image_upload_response.success || !image_upload_response.url) {
        throw new Error("Failed to upload recruiter avatar image to Irys");
      }

      if (image_upload_response.url) {
        avatar_url = image_upload_response.url;
      }
    }

    // Step 4: Create RecruiterProfileInterface object with address and form data
    const recruiterProfile: RecruiterProfileInterface = {
      recruiter_address: address,
      recruiter_fullname: profileData.recruiter_fullname || "",
      recruiter_email: profileData.recruiter_email || "",
      recruiter_phone: profileData.recruiter_phone || "",
      recruiter_position: profileData.recruiter_position || "",
      recruiter_bio: profileData.recruiter_bio || "",
      recruiter_avatar_url: avatar_url,
      company_name: profileData.company_name || "",
      company_website: profileData.company_website || "",
      company_location: profileData.company_location || "",
      company_industry: profileData.company_industry || "",
      company_size: profileData.company_size || "",
      company_description: profileData.company_description || "",
    };

    // Step 5: Create tags with "Root-TX" to upload to the Irys without changing the data_id
    // This is to ensure that the data_id remains the same and we can update the profile without creating a new entry
    const tags = [{ name: "Root-TX", value: data_id }];

    // Step 6: Upload the JSON object to Irys with Root-TX tags
    const { data: jsonUploadResponse } =
      await axios.post<IrysUploadResponseInterface>(
        "/api/irys/upload/upload-string",
        {
          data: JSON.stringify(recruiterProfile),
          tags: tags,
        }
      );

    if (!jsonUploadResponse.success) {
      throw new Error("Failed to upload recruiter profile JSON to Irys");
    }

    if (!jsonUploadResponse.id) {
      throw new Error("No transaction ID returned from Irys upload");
    }

    return jsonUploadResponse.id;
  } catch (error) {
    console.error("Error updating recruiter profile data with Root-TX:", error);
    throw error;
  }
};

/**
 * Register new recruiter profile
 * @param address - The recruiter's wallet address
 * @param profileData - The new profile data
 */
export const registerRecruiterProfile = async (
  address: `0x${string}`,
  profileData: RecruiterFormValues
) => {
  try {
    // Step 1: Upload the recruiter_avatar image first if it exists
    let avatar_url = "";
    if (profileData.recruiter_avatar) {
      const { data: image_upload_response } =
        await axios.post<IrysUploadResponseInterface>(
          "/api/irys/upload/upload-file",
          profileData.recruiter_avatar
        );

      if (!image_upload_response.success || !image_upload_response.url) {
        throw new Error("Failed to upload recruiter avatar image to Irys");
      }

      if (image_upload_response.url) {
        avatar_url = image_upload_response.url;
      }
    }

    // Step 2: Create RecruiterProfileInterface object with address and form data
    const recruiter_profile: RecruiterProfileInterface = {
      recruiter_address: address,
      recruiter_fullname: profileData.recruiter_fullname || "",
      recruiter_email: profileData.recruiter_email || "",
      recruiter_phone: profileData.recruiter_phone || "",
      recruiter_position: profileData.recruiter_position || "",
      recruiter_bio: profileData.recruiter_bio || "",
      recruiter_avatar_url: avatar_url,
      company_name: profileData.company_name || "",
      company_website: profileData.company_website || "",
      company_location: profileData.company_location || "",
      company_industry: profileData.company_industry || "",
      company_size: profileData.company_size || "",
      company_description: profileData.company_description || "",
    };

    // Step 3: Upload the JSON object to Irys
    const { data: json_upload_response } =
      await axios.post<IrysUploadResponseInterface>(
        "/api/irys/upload/upload-string",
        {
          data: JSON.stringify(recruiter_profile),
        }
      );

    if (!json_upload_response.success) {
      throw new Error("Failed to upload recruiter profile JSON to Irys");
    }

    if (!json_upload_response.id) {
      throw new Error("No transaction ID returned from Irys upload");
    }

    // Step 4: Call the createRecruiterProfile function in the smart contract
    const { request } = await simulateContract(wagmiConfig, {
      address: ContractConfig_RecruiterDataManager.address as `0x${string}`,
      abi: ContractConfig_RecruiterDataManager.abi,
      functionName: "createRecruiterProfile",
      args: [json_upload_response.id],
    });

    const txHash = await writeContract(wagmiConfig, request);
    
    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash: txHash,
    });

    console.log("Recruiter profile registered successfully:", receipt);
    return { success: true, txHash, dataId: json_upload_response.id };

  } catch (error) {
    console.error("Error registering recruiter profile:", error);
    throw error;
  }
};
