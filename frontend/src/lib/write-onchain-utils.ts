import { fetchSolutionTxIdByUserAndChallengeId } from "@/lib/fetching-onchain-data-utils";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import {
  ContractConfig_ChallengeManager,
  ContractConfig_SolutionManager,
  ContractConfig_UserDataManager,
} from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import { ModeratorReviewValues } from "@/features/moderation/review-challenge-form";
import { ChallengeFormValues } from "@/features/contribution/contribute-challenge-form";
import axios from "axios";
import { uploadImagesInHTML } from "@/lib/utils";
import { IrysUploadResponseInterface } from "@/lib/interfaces";
import { ProfileFormValues } from "@/features/account/profile-settings/profile-form";

export async function joinReviewPool(
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

export async function waitForTransaction(txHash: `0x${string}`): Promise<void> {
  await waitForTransactionReceipt(wagmiConfig, {
    hash: txHash,
  });
}

export async function submitModeratorReview(
  challengeId: number,
  address: `0x${string}`,
  data: ModeratorReviewValues
) {
  const txHash = await writeContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "submitModeratorReview",
    args: [
      challengeId,
      data.relevance,
      data.technical_correctness,
      data.completeness,
      data.clarity,
      data.originality,
      data.unbiased,
      data.plagiarism_free,
      data.suggested_difficulty,
      data.suggested_category,
      data.suggested_solve_time,
    ],
    account: address,
  });
  return txHash;
}

export async function contributeChallenge(
  address: `0x${string}`,
  data: ChallengeFormValues
) {
  const handledDescription = await uploadImagesInHTML(data.description);

  const [
    { data: title_upload_res_data },
    { data: description_upload_res_data },
  ] = await Promise.all([
    axios.post<IrysUploadResponseInterface>("/api/irys/upload/upload-string", {
      data: data.title,
    }),
    axios.post<IrysUploadResponseInterface>("/api/irys/upload/upload-string", {
      data: handledDescription,
    }),
  ]);

  const txHash = await writeContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "contributeChallenge",
    args: [
      title_upload_res_data.url,
      description_upload_res_data.url,
      data.category,
    ],
    account: address,
  });

  return txHash;
}

export async function userJoinChallenge(
  challengeId: number,
  address: `0x${string}`
) {
  const { data: solution_upload_res } =
    await axios.post<IrysUploadResponseInterface>(
      "/api/irys/upload/upload-string",
      { data: " " }
    );

  const txHash = await writeContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "userJoinChallenge",
    args: [
      challengeId,
      solution_upload_res.id
    ],
    account: address,
  });

  return txHash;
}

export async function saveSolutionDraft(
  challengeId: number,
  address: `0x${string}`,
  solution: string
) {
  const solutionTxId = await fetchSolutionTxIdByUserAndChallengeId(
    address,
    challengeId
  );
  const tags = [{ name: "Root-TX", value: solutionTxId }];

  const handledSolution = await uploadImagesInHTML(solution);

  await axios.post<IrysUploadResponseInterface>(
    "/api/irys/upload/upload-string",
    {
      data: handledSolution,
      tags: tags,
    }
  );
}

export async function submitSolution(
  challengeId: number,
  address: `0x${string}`,
  solution: string
) {
  const solutionTxId = await fetchSolutionTxIdByUserAndChallengeId(
    address,
    challengeId
  );
  const tags = [{ name: "Root-TX", value: solutionTxId }];

  const handledSolution = await uploadImagesInHTML(solution);

  await axios.post<IrysUploadResponseInterface>(
    "/api/irys/upload/upload-string",
    {
      data: handledSolution,
      tags: tags,
    }
  );

  const txHash = await writeContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "submitSolution",
    args: [challengeId],
    account: address,
  });

  return txHash;
}

export async function updateProfile(
  address: `0x${string}`,
  data: ProfileFormValues
) {
  // No worry about the data duplicated on Irys because it will be handled by Irys itself
  // Upload data to Irys parallelly
  const [{ data: image_upload_res_data }, { data: bio_upload_res_data }] =
    await Promise.all([
      axios.post<IrysUploadResponseInterface>(
        "/api/irys/upload/upload-file",
        data.avatar
      ),
      axios.post<IrysUploadResponseInterface>(
        "/api/irys/upload/upload-string",
        { data: data.bio }
      ),
    ]);

  const txHash = await writeContract(wagmiConfig, {
    address: ContractConfig_UserDataManager.address as `0x${string}`,
    abi: ContractConfig_UserDataManager.abi,
    functionName: "setUserPersonalData",
    args: [data.username, image_upload_res_data.url, bio_upload_res_data.url],
    account: address,
  });

  return txHash;
}
