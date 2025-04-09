import { readContract } from "@wagmi/core";
import { ContractConfig_UserDataManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import { FetchUserDataOnChainOutput } from "./interfaces";

export const fetchUserDataOnChain = async (
  address: `0x${string}`
): Promise<FetchUserDataOnChainOutput> => {
  try {
    const [username, avatar_url, bio_url] = await Promise.all([
      readContract(wagmiConfig, {
        address: ContractConfig_UserDataManager.address as `0x${string}`,
        abi: ContractConfig_UserDataManager.abi,
        functionName: "getUsername",
        args: [address],
      }),
      readContract(wagmiConfig, {
        address: ContractConfig_UserDataManager.address as `0x${string}`,
        abi: ContractConfig_UserDataManager.abi,
        functionName: "getAvatar",
        args: [address],
      }),
      readContract(wagmiConfig, {
        address: ContractConfig_UserDataManager.address as `0x${string}`,
        abi: ContractConfig_UserDataManager.abi,
        functionName: "getBio",
        args: [address],
      }),
    ]);

    return {
      username: username as string | undefined,
      avatar_url: avatar_url as string | undefined,
      bio_url: bio_url as string | undefined,
    };
  } catch (error: any) {
    throw new Error(error);
  }
};
