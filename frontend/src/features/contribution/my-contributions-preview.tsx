'use client';

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";

import { fetchContributedChallenges } from "@/lib/fetching-onchain-challenge";
import { ChallengeInterface } from "@/lib/interfaces";
import { ChallengeSkeleton } from './my-contributions-skeleton'
import { ChallengeCard } from "./challenge-card";
import { EmptyChallenge } from "./empty-challenge";
import { redirect } from "next/navigation";

export function MyContributionsPreview() {
  const { address } = useAccount();
  const [challenges, setChallenges] = useState<ChallengeInterface[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleFetchingContributedChallenges() {
    setIsLoading(true);

    try {
      const fetchedChallenges = await fetchContributedChallenges(address as `0x${string}`);
      setChallenges(fetchedChallenges);
    } catch (error) {
      console.error("Error fetching contributed challenges:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (address) {
      handleFetchingContributedChallenges();
    }
  }, [address]);

  const handleCreateNew = () => {
    redirect('contribute');
  }

  return (
    isLoading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
        {[...Array(4)].map((_, index) => (
          <ChallengeSkeleton key={index} />
        ))}
      </div>
    ) : challenges.length === 1 ? (
      <div className="w-full max-w-md mx-auto">
        <ChallengeCard challenge={challenges[0]} />
      </div>
    ) : challenges.length > 1 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
        {challenges.map((challenge, index) => (
          <ChallengeCard key={index} challenge={challenge} />
        ))}
      </div>
    ) : (
      <div>
        <EmptyChallenge onCreateNew={handleCreateNew} />
      </div>)
  );
}