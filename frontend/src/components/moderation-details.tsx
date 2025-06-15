"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { ChallengeInterface } from "@/lib/interfaces";
import {
  getChallengePotInfo,
  getChallengeFinalizedStatus,
  getModeratorReviewOfChallenge,
} from "@/lib/fetching-onchain-data-utils";
import { getUserDomainReputationScore } from "@/lib/get/get-reputation-score-utils";
import { getScoreDeviationOfModeratorReview } from "@/lib/get/get-moderation-data-utils";
import { Domain } from "@/constants/system";

interface ModerationDetailsProps {
  challenge: ChallengeInterface;
}

interface ModeratorInfo {
  moderator: string;
  score: number;
  reputation?: number;
  deviation?: number;
}

const truncateAddress = (address: string): string => {
  if (!address || address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard");
  } catch (error) {
    toast.error("Failed to copy address");
  }
};

export function ModerationDetails({ challenge }: ModerationDetailsProps) {
  const [isFinalized, setIsFinalized] = useState(false);
  const [moderators, setModerators] = useState<ModeratorInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [finalized, potInfo] = await Promise.all([
          getChallengeFinalizedStatus(challenge.id),
          getChallengePotInfo(challenge.id),
        ]);
        setIsFinalized(finalized);
        const infos = await Promise.all(
          potInfo.moderators.map(async (mod) => {
            const review = await getModeratorReviewOfChallenge(
              challenge.id,
              mod.moderator as `0x${string}`
            );
            let reputation: number | undefined = undefined;
            let deviation: number | undefined = undefined;
            if (finalized) {
              try {
                reputation = await getUserDomainReputationScore(
                  mod.moderator as `0x${string}`,
                  challenge.category as Domain
                );
                deviation = await getScoreDeviationOfModeratorReview(
                  challenge.id,
                  mod.moderator as `0x${string}`
                );
              } catch (err) {
                console.error("Error fetching reputation:", err);
              }
            }
            return {
              moderator: mod.moderator,
              score: review?.review_score ?? 0,
              reputation,
              deviation,
            } as ModeratorInfo;
          })
        );
        setModerators(infos);
      } catch (err) {
        console.error("Error fetching moderation details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [challenge]);

  return (
    <div className="py-4">
      <h3 className="font-bold mb-2 text-xl">Moderation Details</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Separator className="my-2" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Moderator</TableHead>
                <TableHead className="text-right w-[80px]">Score</TableHead>
                <TableHead className="text-right w-[120px]">
                  Domain Rep.
                </TableHead>
                <TableHead className="text-right w-[100px]">
                  Deviation
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moderators.map((mod) => (
                <TableRow key={mod.moderator}>
                  <TableCell className="whitespace-nowrap overflow-hidden">
                    <TooltipProvider>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate w-[120px] cursor-pointer">
                              {truncateAddress(mod.moderator)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{mod.moderator}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(mod.moderator)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy address</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right">{mod.score}</TableCell>
                  <TableCell className="text-right">
                    {isFinalized ? mod.reputation ?? "--" : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {isFinalized ? mod.deviation ?? "--" : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {moderators.length === 0 && (
              <TableCaption>No moderation data.</TableCaption>
            )}
          </Table>
          {!isFinalized && (
            <p className="text-xs text-muted-foreground mt-2">
              Domain reputation and deviation available after finalization.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default ModerationDetails;
