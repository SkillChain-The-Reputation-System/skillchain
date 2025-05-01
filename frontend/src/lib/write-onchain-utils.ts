import { writeContract } from "@wagmi/core";
import { ContractConfig_ChallengeManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";

async function joinReviewPool(
  challengeId: number,
  address: `0x${string}`
) {
    // send transaction and return tx hash
    const txHash = await writeContract(wagmiConfig, {
        address: ContractConfig_ChallengeManager.address as `0x${string}`,
        abi: ContractConfig_ChallengeManager.abi,
        functionName: "joinReviewPool",
        args: [challengeId],
        account: address,
    });
    return txHash;
}

export { joinReviewPool };
