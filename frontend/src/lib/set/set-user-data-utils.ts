import axios from "axios";
import {
  IrysUploadResponseInterface,
  UserProfileInterface,
} from "@/lib/interfaces";
import { ProfileFormValues } from "@/features/account/profile-settings/profile-form";
import {
  writeContract,
  simulateContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { ContractConfig_UserDataManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import { getUserAvatarUrl, getUserDataId } from "@/lib/get/get-user-data-utils";

/**
 * Uploads profile form data to Irys with user address
 * @param address - User's wallet address
 * @param data - Profile form data of type ProfileFormValues
 * @returns The Irys transaction ID of the uploaded JSON object
 * @throws Error if upload fails or no ID is returned
 */
export async function uploadProfileDataForTheFirstTime(
  address: `0x${string}`,
  data: ProfileFormValues
): Promise<string> {
  try {
    let avatar_url = ""; // Step 1: Upload the avatar image first if it exists
    if (data.avatar) {
      const { data: image_upload_response } =
        await axios.post<IrysUploadResponseInterface>(
          "/api/irys/upload/upload-file",
          data.avatar
        );

      if (!image_upload_response.success || !image_upload_response.url) {
        throw new Error("Failed to upload avatar image to Irys");
      }

      if (image_upload_response.url) {
        avatar_url = image_upload_response.url;
      }
    }

    // Step 2: Create UserProfileInterface object with address
    const user_profile: UserProfileInterface = {
      address: address,
      fullname: data.fullname || "",
      location: data.location || "",
      email: data.email || "",
      avatar_url: avatar_url,
      bio: data.bio || "",
    }; // Step 3: Upload the JSON object to Irys
    const { data: json_upload_response } =
      await axios.post<IrysUploadResponseInterface>(
        "/api/irys/upload/upload-string",
        {
          data: JSON.stringify(user_profile),
        }
      );

    if (!json_upload_response.success) {
      throw new Error("Failed to upload profile JSON to Irys");
    }

    if (!json_upload_response.id) {
      throw new Error("No transaction ID returned from Irys upload");
    }

    return json_upload_response.id;
  } catch (error) {
    console.error("Error uploading profile data with address:", error);
    throw error;
  }
}



/**
 * Updates profile data for an already registered user by getting the data_id from smart contract and uploading to Irys with Root-TX tags.
 * @param address - User's wallet address
 * @param data - Profile form data of type ProfileFormValues
 * @returns The Irys transaction ID of the uploaded JSON object
 * @throws Error if user is not registered, upload fails, or no ID is returned
 */
export async function updateProfileDataWithRootTx(
  address: `0x${string}`,
  data: ProfileFormValues
): Promise<string> {
  try {
    // Step 1: Get the data_id from smart contract by calling getUserDataId
    const data_id = await getUserDataId(address);

    if (!data_id) {
      throw new Error("User is not registered or data_id not found");
    }

    let avatar_url = await getUserAvatarUrl(address);

    // Step 2: Upload the avatar image first if it exists
    if (data.avatar) {
      console.log("Uploading avatar image to Irys...: ", data.avatar);
      const { data: image_upload_response } =
        await axios.post<IrysUploadResponseInterface>(
          "/api/irys/upload/upload-file",
          data.avatar
        );

      if (!image_upload_response.success || !image_upload_response.url) {
        throw new Error("Failed to upload avatar image to Irys");
      }

      if (image_upload_response.url) {
        avatar_url = image_upload_response.url;
      }
    }

    // Step 3: Create UserProfileInterface object with address
    const userProfile: UserProfileInterface = {
      address: address,
      fullname: data.fullname || "",
      location: data.location || "",
      email: data.email || "",
      avatar_url: avatar_url || "",
      bio: data.bio || "",
    };

    // Step 4: Create tags with "Root-TX" to upload to the Irys without changing the data_id
    // This is to ensure that the data_id remains the same and we can update the profile without creating a new entry
    const tags = [{ name: "Root-TX", value: data_id }];

    // Step 5: Upload the JSON object to Irys with Root-TX tags
    const { data: jsonUploadResponse } =
      await axios.post<IrysUploadResponseInterface>(
        "/api/irys/upload/upload-string",
        {
          data: JSON.stringify(userProfile),
          tags: tags,
        }
      );

    if (!jsonUploadResponse.success) {
      throw new Error("Failed to upload profile JSON to Irys");
    }

    if (!jsonUploadResponse.id) {
      throw new Error("No transaction ID returned from Irys upload");
    }

    return jsonUploadResponse.id;
  } catch (error) {
    console.error("Error updating profile data with Root-TX:", error);
    throw error;
  }
}



/**
 * Registers a new user profile by uploading data to Irys and then registering on-chain
 * @param address - User's wallet address
 * @param data - Profile form data of type ProfileFormValues
 * @returns The transaction hash of the blockchain registration
 * @throws Error if upload fails, registration fails, or user is already registered
 */
export async function registerProfile(
  address: `0x${string}`,
  data: ProfileFormValues
): Promise<`0x${string}`> {
  try {
    // Step 1: Upload profile data to Irys using the existing function
    const data_id = await uploadProfileDataForTheFirstTime(address, data);

    // Step 2: Simulate the contract call to check for errors
    await simulateContract(wagmiConfig, {
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: "registerNewUser",
      args: [data_id],
      account: address,
    });

    // Step 3: Execute the actual contract call
    const txHash = await writeContract(wagmiConfig, {
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: "registerNewUser",
      args: [data_id],
      account: address,
    });

    // Step 4: Wait for the transaction to be mined
    await waitForTransactionReceipt(wagmiConfig, { hash: txHash });

    return txHash;
  } catch (error) {
    console.error("Error registering profile:", error);
    throw error;
  }
}

/**
 * Updates an existing user profile by uploading new data to Irys
 * @param address - User's wallet address
 * @param data - Profile form data of type ProfileFormValues
 * @returns The Irys transaction ID of the uploaded JSON object
 * @throws Error if upload fails or no ID is returned
 */
export async function updateProfile(
  address: `0x${string}`,
  data: ProfileFormValues
): Promise<string> {
  try {
    // Upload the updated profile data to Irys
    const data_id = await updateProfileDataWithRootTx(address, data);

    return data_id;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}
