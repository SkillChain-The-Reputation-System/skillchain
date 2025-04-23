'use client';

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";

import { fetchContributedChallenges } from "@/lib/fetching-onchain-challenge";
import { ChallengeInterface } from "@/lib/interfaces";

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

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : challenges.length > 0 ? (
        <ul>
          {challenges.map((challenge, index) => (
            <li key={index} className="mb-4 p-4 border rounded">
              <p><strong>Title:</strong> {challenge.title}</p>
              <p><strong>Description:</strong> {challenge.description}</p>
              <p><strong>Category:</strong> {challenge.category}</p>
              <p><strong>Created at:</strong> {challenge.date}</p>
              <p><strong>Status:</strong> {challenge.isApproved ? "Approved" : "Pending"}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No contributions found.</p>
      )}
    </div>
  );
}