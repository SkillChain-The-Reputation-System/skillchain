'use client'

// Import hooks
import { useState, useEffect } from "react"
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

// Import UI components
import { WorkspaceCard } from "@/features/participation/workspace/workspace-card";
import { ChallengeSkeleton } from "@/features/participation/challenge-skeleton";
import { EmptyChallenge } from "@/features/participation/empty-challenge";

// Import utils
import { JoinedChallengePreview } from "@/lib/interfaces"
import { fetchJoinedChallengesPreviewByUser } from "@/lib/fetching-onchain-data-utils";
import { pageUrlMapping } from "@/constants/navigation";

export default function Workspace() {
  const { address } = useAccount();
  const [previewList, setPreviewList] = useState<JoinedChallengePreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const cardOnClick = (id: string) => {
    router.push(
      pageUrlMapping.participation_workspace + `/${id}`
    );
  }

  // fetch data once
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!address)
        return;

      setIsLoading(true);
      try {
        const fetchedLists = await fetchJoinedChallengesPreviewByUser(address);
        setPreviewList(fetchedLists);
      } catch (error) {
        console.error("Error fetching approved challenges:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [address]);

  return (
    <>
      {
        address && (
          isLoading ? (
            <div className="grid grid-cols-1 w-full max-w-5xl mx-auto">
              {[...Array(8)].map((_, index) => (
                <ChallengeSkeleton key={index} />
              ))}
            </div>
          ) : previewList.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 w-full max-w-5xl mx-auto">
              {previewList.map((challengePreview, index) => (
                <WorkspaceCard key={index} previewChallenge={challengePreview} onClick={cardOnClick} />
              ))}
            </div>
          ) : (
            <div>
              <EmptyChallenge workSpacePreview={true} />
            </div>
          )
        )
      }
    </>
  )
}