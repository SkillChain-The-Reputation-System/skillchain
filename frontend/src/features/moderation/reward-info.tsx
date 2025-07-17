"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { Coins, Star, TrendingUp, TrendingDown, Minus, Percent, Loader2, InfoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChallengePotInfoInterface, ChallengeInterface, ModeratorReview } from "@/lib/interfaces";
import { getChallengePotInfo } from "@/lib/fetching-onchain-data-utils";
import { NATIVE_TOKEN_SYMBOL, ChallengeStatus } from "@/constants/system";
import { cn } from "@/lib/utils";

interface RewardInfoProps {
  challengeId: `0x${string}`;
  challenge: ChallengeInterface | null;
  moderatorReview: ModeratorReview | null | undefined;
}

export default function RewardInfo({ challengeId, challenge, moderatorReview }: RewardInfoProps) {
  const { address } = useAccount();
  const [potInfo, setPotInfo] = useState<ChallengePotInfoInterface | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInfo() {
      try {
        setLoading(true);
        const info = await getChallengePotInfo(challengeId);
        setPotInfo(info);
      } catch (err) {
        console.error("Error fetching reward info:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInfo();
  }, [challengeId]);

  const reward = potInfo?.moderators.find(
    (m) => address && m.moderator.toLowerCase() === address.toLowerCase()
  )?.reward;

  const bounty = potInfo?.bounty;
  const moderatorScore = moderatorReview?.review_score;
  const finalScore = challenge?.qualityScore;
  const deviation =
    finalScore !== undefined && moderatorScore !== undefined
      ? Number(finalScore) - Number(moderatorScore)
      : undefined;
  const rewardPercentage =
    reward !== undefined && bounty
      ? (Number(reward) / Number(bounty)) * 100
      : undefined;

  const isFinalized =
    challenge &&
    (challenge.status === ChallengeStatus.APPROVED ||
      challenge.status === ChallengeStatus.REJECTED) &&
    potInfo?.isFinalized;

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Reward Information</h2>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !isFinalized ? (
        <div className="text-center py-8">
          <InfoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Reward details will be available once this challenge is finalized.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Total Bounty</span>
            <div className="flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-amber-500" />
              <Badge variant="secondary" className="font-semibold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 dark:from-amber-900/20 dark:to-yellow-900/20 dark:text-amber-300">
                {bounty !== undefined ? `${bounty.toFixed(4)} ${NATIVE_TOKEN_SYMBOL}` : "--"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Your Score</span>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-current" />
              <span>{moderatorScore !== undefined ? moderatorScore : "--"}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Final Score</span>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-green-500 fill-current" />
              <span>{finalScore !== undefined ? finalScore : "--"}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Deviation</span>
            <div className="flex items-center gap-1.5">
              {deviation !== undefined ? (
                <>
                  {deviation > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : deviation < 0 ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-500" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      deviation > 0
                        ? "text-red-600 dark:text-red-400"
                        : deviation < 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-600 dark:text-gray-400"
                    )}
                  >
                    {deviation > 0 ? "+" : ""}
                    {deviation.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">--</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Reward Tokens</span>
            <div className="flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-amber-500" />
              <Badge variant="secondary" className="font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-300">
                {reward !== undefined ? `${reward.toFixed(4)} ${NATIVE_TOKEN_SYMBOL}` : "--"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Reward % of Bounty</span>
            <div className="flex items-center gap-1.5">
              <Percent className="h-4 w-4" />
              <span>{rewardPercentage !== undefined ? `${rewardPercentage.toFixed(2)}%` : "--"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
