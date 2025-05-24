import { Domain, JobStatus } from "@/constants/system";
import { fetchJobById, fetchUserReputationScore } from "@/lib/fetching-onchain-data-utils";
import { GetCurrentTimeResponse } from "@/lib/interfaces";

/**
 * Checks if a user is valid to apply for a job
 * @param address The user's blockchain address
 * @param jobId The ID of the job to apply for
 * @returns An object with validation result and message to display
 */
export const checkUserValidToApplyForJob = async (
  address: `0x${string}`,
  jobId: string
): Promise<{ isValid: boolean; message: string }> => {
  try {
    // 1. Fetch the job details
    const job = await fetchJobById(jobId);
    
    // If job doesn't exist, user can't apply
    if (!job) {
      console.error("Job not found");
      return { isValid: false, message: "Job not found" };
    }

    // 2. Check if user is the recruiter
    if (job.recruiter && job.recruiter === address) {
      console.log("Recruiter cannot apply to their own job");
      return { isValid: false, message: "You cannot apply to your own job posting" };
    }

    // 3. Check if job is in OPEN status
    if (job.status !== JobStatus.OPEN) {
      console.log("Job is not in OPEN status");
      return { isValid: false, message: "This job is no longer accepting applications" };
    }

    // 4. Check if current time is before deadline
    const currentTimeResponse = await fetch('/api/utils/time/get-current-time');
    const currentTimeData = await currentTimeResponse.json() as GetCurrentTimeResponse;
    
    if (!currentTimeData.success) {
      console.error("Failed to get current time");
      return { isValid: false, message: "Failed to verify application deadline" };
    }
    
    const currentTime = currentTimeData.time;
    
    if (currentTime >= job.deadline) {
      console.log("Application deadline has passed");
      return { isValid: false, message: "Application deadline has passed" };
    }
    
    // 5. Check if user's reputation meets job requirements
    const userReputation = await fetchUserReputationScore(address);
    
    // Check global reputation if required
    if (job.requireGlobalReputation && job.globalReputationScore !== undefined) {
      if (userReputation.global_reputation < job.globalReputationScore) {
        console.log("User's global reputation does not meet job requirements");
        return { isValid: false, message: "Your global reputation does not meet requirements" };
      }
    }    
    
    // Check domain-specific reputation requirements
    if (job.domainReputations && Object.keys(job.domainReputations).length > 0) {
      for (const domainIdStr of Object.keys(job.domainReputations)) {
        // Convert string key to Domain enum value
        const domainId = Number(domainIdStr) as Domain;
        const requiredScore = job.domainReputations[domainId];
        
        // Check if user has sufficient reputation for this domain
        if (domainId >= 0 && domainId < userReputation.domain_reputation.length) {
          const userDomainScore = userReputation.domain_reputation[domainId];
          
          if (userDomainScore < requiredScore) {
            console.log(`User's reputation in domain ${Domain[domainId]} does not meet job requirements`);
            return { isValid: false, message: `Your reputation in ${Domain[domainId]} does not meet the requirements` };
          }
        } else {
          console.log(`Domain ${Domain[domainId]} not found in user's reputation scores`);
          return { isValid: false, message: "Error verifying your reputation scores" };
        }
      }
    }
    
    // All checks passed, user is valid to apply
    return { isValid: true, message: "You are eligible to apply for this job" };
    
  } catch (error) {
    console.error("Error checking if user is valid to apply for job:", error);
    return { isValid: false, message: "Error verifying eligibility" };
  }
};