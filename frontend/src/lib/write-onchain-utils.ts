import {
  fetchModeratorReviewTxIdByModeratorAndChallengeId,
  fetchSolutionTxIdByUserAndChallengeId,
  fetchJobContentID,
  fetchJobStatus,
} from "@/lib/fetching-onchain-data-utils";
import {
  writeContract,
  waitForTransactionReceipt,
  simulateContract,
  readContract,
} from "@wagmi/core";
import {
  ContractConfig_ChallengeManager,
  ContractConfig_JobManager,
  ContractConfig_JobApplicationManager,
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
import { JobFormData } from "@/features/jobs-on-recruiter/create/create-job-form";
import { JobApplicationStatus, JobStatus } from "@/constants/system";

export async function joinReviewPool(
  challengeId: number,
  address: `0x${string}`
) {
  // Upload empty review data to Irys to get the fixed transaction id
  const { data: review_upload_res } =
    await axios.post<IrysUploadResponseInterface>(
      "/api/irys/upload/upload-string",
      { data: " " }
    );

  await simulateContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "joinReviewPool",
    args: [challengeId, review_upload_res.id],
    account: address,
  });

  const txHash = await writeContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "joinReviewPool",
    args: [challengeId, review_upload_res.id],
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
  saveModeratorReviewDraft(challengeId, address, JSON.stringify(data));

  await simulateContract(wagmiConfig, {
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
    args: [challengeId, solution_upload_res.id],
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

export async function saveModeratorReviewDraft(
  challengeId: number,
  address: `0x${string}`,
  review_data: string
) {
  const moderator_review_txid =
    await fetchModeratorReviewTxIdByModeratorAndChallengeId(
      address,
      challengeId
    );
  const tags = [{ name: "Root-TX", value: moderator_review_txid }];

  await axios.post<IrysUploadResponseInterface>(
    "/api/irys/upload/upload-string",
    {
      data: review_data,
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

export async function putSolutionUnderReview(
  challengeId: number,
  address: `0x${string}`
) {
  const txHash = await writeContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "putSolutionUnderReview",
    args: [challengeId],
    account: address,
  });

  return txHash;
}

export async function joinEvaluationPool(
  solutionId: number,
  address: `0x${string}`
) {
  const txHash = await writeContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "evaluatorJoinSolution",
    args: [solutionId],
    account: address,
  });

  return txHash;
}

export async function submitEvaluationScore(
  solutionId: number,
  address: `0x${string}`,
  score: number
) {
  const txHash = await writeContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "evaluatorSubmitScore",
    args: [solutionId, score],
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

export async function createJob(address: `0x${string}`, _data: JobFormData) {
  const { data: job_content_upload_res } =
    await axios.post<IrysUploadResponseInterface>(
      "/api/irys/upload/upload-string",
      { data: JSON.stringify(_data) }
    );

  await simulateContract(wagmiConfig, {
    address: ContractConfig_JobManager.address as `0x${string}`,
    abi: ContractConfig_JobManager.abi,
    functionName: "createJob",
    args: [job_content_upload_res.id],
    account: address,
  });

  const txHash = await writeContract(wagmiConfig, {
    address: ContractConfig_JobManager.address as `0x${string}`,
    abi: ContractConfig_JobManager.abi,
    functionName: "createJob",
    args: [job_content_upload_res.id],
    account: address,
  });

  return txHash;
}

export async function updateJobContent(
  jobId: string,
  _data: JobFormData
) {
  try {
    // Get the content_id from the smart contract using the fetching function
    const content_id = await fetchJobContentID(jobId);

    // Create tags to link this update to the original content
    const tags = [{ name: "Root-TX", value: content_id }];

    // Upload job data to Irys with the Root-TX tag
    const { data: upload_res } = await axios.post<IrysUploadResponseInterface>(
      "/api/irys/upload/upload-string",
      {
        data: JSON.stringify(_data),
        tags: tags,
      }
    );

    console.log("Job content updated on Irys with Root-TX:", content_id);
    return upload_res.id; // Return the transaction ID of the updated content
  } catch (error) {
    console.error("Error updating job content:", error);
    throw error;
  }
}
/**
 * Update a job status
 * @param jobId The job ID
 * @param newStatus The new job status
 * @returns The transaction hash
 */
export async function updateJobStatus(
  jobId: string,
  newStatus: JobStatus
): Promise<`0x${string}`> {
 try {
    let functionName: string;
    // Get current job status to determine correct transition method
    const currentStatus = await fetchJobStatus(jobId);
    
    // Select the appropriate contract function based on the status transition
    switch (newStatus) {
      case JobStatus.OPEN:
        // From DRAFT to OPEN (publish) or from PAUSED to OPEN (resume)
        functionName = currentStatus === JobStatus.DRAFT ? "publishJob" : "resumeJob";
        break;
      case JobStatus.PAUSED:
        functionName = "pauseJob";
        break;
      case JobStatus.CLOSED:
        functionName = "closeJob";
        break;
      case JobStatus.ARCHIVED:
        functionName = "archiveJob";
        break;
      case JobStatus.FILLED:
        functionName = "fillJob";
        break;
      default:
        throw new Error(`Unsupported status transition to ${newStatus}`);
    }

    await simulateContract(wagmiConfig, {
      address: ContractConfig_JobManager.address as `0x${string}`,
      abi: ContractConfig_JobManager.abi,
      functionName,
      args: [jobId],
    });

    const txHash = await writeContract(wagmiConfig, {
      address: ContractConfig_JobManager.address as `0x${string}`,
      abi: ContractConfig_JobManager.abi,
      functionName,
      args: [jobId],
    });

    await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
    
    return txHash;
  } catch (error) {
    console.error("Error updating job status:", error);
    throw error;
  }
}

export async function submitJobApplication(
  address: `0x${string}`,
  jobId: string,
): Promise<`0x${string}`> {
  try {
    // First simulate the transaction to check for any errors
    await simulateContract(wagmiConfig, {
      address: ContractConfig_JobApplicationManager.address as `0x${string}`,
      abi: ContractConfig_JobApplicationManager.abi,
      functionName: "submitApplication",
      args: [jobId],
      account: address,
    });

    // If simulation passes, execute the actual transaction
    const txHash = await writeContract(wagmiConfig, {
      address: ContractConfig_JobApplicationManager.address as `0x${string}`,
      abi: ContractConfig_JobApplicationManager.abi,
      functionName: "submitApplication",
      args: [jobId],
      account: address,
    });

    // Wait for the transaction to be mined
    await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
    
    return txHash;
  } catch (error) {
    console.error("Error submitting job application:", error);
    throw error;
  }
}

/**
 * Update a job application status
 * @param applicationId The application ID
 * @param newStatus The new application status
 * @returns The transaction hash
 */
export async function updateJobApplicationStatus(
  applicationId: string,
  newStatus: JobApplicationStatus
): Promise<`0x${string}`> {
  try {
    // Simulate the transaction to check for errors
    await simulateContract(wagmiConfig, {
      address: ContractConfig_JobApplicationManager.address as `0x${string}`,
      abi: ContractConfig_JobApplicationManager.abi,
      functionName: "updateApplicationStatus",
      args: [applicationId, newStatus],
    });

    // Send the transaction
    const txHash = await writeContract(wagmiConfig, {
      address: ContractConfig_JobApplicationManager.address as `0x${string}`,
      abi: ContractConfig_JobApplicationManager.abi,
      functionName: "updateApplicationStatus",
      args: [applicationId, newStatus],
    });

    // Wait for transaction to be mined
    await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
    
    return txHash;
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
}
