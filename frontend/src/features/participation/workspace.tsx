'use client'

import { useState, useEffect } from "react"
import { ChallengeInterface } from "@/lib/interfaces"
import { fetchJoinedChallengesByUser } from "@/lib/fetching-onchain-data-utils";
import { useAccount } from "wagmi";
import { ExploreSkeleton } from "./explore-skeleton";
import { ChallengeCard } from "./challenge-card";
import { EmptyChallenge } from "./empty-challenge";
import { pageUrlMapping } from "@/constants/navigation";
import { useRouter } from "next/navigation";

export default function Workspace() {
  const { address } = useAccount();
  const [joinedChallenges, setJoinedChallenges] = useState<ChallengeInterface[]>([]);
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
        const fetchedChallenges = await fetchJoinedChallengesByUser(address);
        setJoinedChallenges(fetchedChallenges);
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
            <div className="grid grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
              {[...Array(8)].map((_, index) => (
                <ExploreSkeleton key={index} />
              ))}
            </div>
          ) : joinedChallenges.length > 0 ? (
            <div className="grid grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
              {joinedChallenges.map((challenge, index) => (
                <ChallengeCard key={index} challenge={challenge} onClick={cardOnClick} />
              ))}
            </div>
          ) : (
            <div>
              <EmptyChallenge />
            </div>
          )
        )
      }
    </>
  )
}