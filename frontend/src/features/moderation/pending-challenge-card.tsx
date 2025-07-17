"use client";

// Import hooks
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import {
  getChallengeFinalizedStatus,
  getJoinReviewPoolStatus,
  getReviewPoolSize,
  getReviewQuorum,
} from "@/lib/fetching-onchain-data-utils";

// Import UI components
import { GenericChallengeCard } from "@/components/generic-challenge-card";
import { Button } from "@/components/ui/button";

// Import utils
import { ChallengeInterface } from "@/lib/interfaces";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  challenge: ChallengeInterface;
  reload: boolean;
  handleJoiningReviewPool: (challenge_id: string | undefined) => void;
}

export function ChallengeCard({
  challenge,
  reload,
  handleJoiningReviewPool,
}: ChallengeCardProps) {
  const { address } = useAccount();
  const [isJoined, setIsJoined] = useState<boolean>(challenge.isJoined ?? false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isChallengeFinalized, setIsChallengeFinalized] = useState(false);
  const [isFullReviewPool, setIsFullReviewPool] = useState(false);

  async function handleGetJoinReviewPoolStatus() {
    if (!address) {
      setLoadingStatus(false);
      return;
    }
    try {
      const joined = await getJoinReviewPoolStatus(
        address,
        challenge.id
      );
      setIsJoined(joined);
    } catch (error) {
      toast.error(`Error fetching join review pool status: ${error}`);
    } finally {
      setLoadingStatus(false);
    }
  }

  // check if current user already joined review pool
  useEffect(() => {
    if (challenge.isJoined !== undefined) {
      setIsJoined(challenge.isJoined);
      setLoadingStatus(false);
    } else {
      handleGetJoinReviewPoolStatus();
    }
  }, [address, challenge.id, reload, challenge.isJoined]);

  // Fetch review pool size and quorum when the challenge ID changes
  useEffect(() => {
    async function fetchPoolInfo() {
      try {
        const [size, q, is_finalized] = await Promise.all([
          getReviewPoolSize(challenge.id),
          getReviewQuorum(),
          getChallengeFinalizedStatus(challenge.id),
        ]);
        setIsChallengeFinalized(is_finalized);
        setIsFullReviewPool(size >= q);
      } catch (error) {
        toast.error(`Error fetching review pool info: ${error}`);
      }
    }
    fetchPoolInfo();
  }, [challenge.id, reload]);

  async function handleJoinClick() {
    setLoadingStatus(true);
    try {
        await handleJoiningReviewPool(challenge.id);
    } finally {
        setLoadingStatus(false);
    }
}

  const primaryButton = (
    <Button
      variant="default"
      className={cn(
        "cursor-pointer",
        isJoined && "bg-green-500 hover:bg-green-600 text-white"
      )}
      onClick={handleJoinClick}
      disabled={loadingStatus || isJoined || isChallengeFinalized || isFullReviewPool}
    >
      {isJoined ? "Joined" : "Join Review Pool"}
    </Button>
  );

  return <GenericChallengeCard challenge={challenge} primaryButton={primaryButton} reload={reload} />;
}
