"use client";

import { Badge } from "@/components/ui/badge";
import {
  CalendarArrowUp,
  Clock,
  Tag,
  UserRoundPen,
  Star,
  Users,
  Copy,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getUserNameByAddress } from "@/lib/get/get-user-data-utils";
import { cn } from "@/lib/utils";
import { ChallengeInterface } from "@/lib/interfaces";
import {
  ChallengeDifficultyLevel,
  ChallengeDifficultyLevelLabels,
  Domain,
  DomainLabels,
} from "@/constants/system";
import { difficultyStyles } from "@/constants/styles";
import { epochToDateString } from "@/lib/time-utils";

interface ChallengeContentProps {
  challenge: ChallengeInterface | null;
}

export default function ChallengeContent({ challenge }: ChallengeContentProps) {
  const [contributorName, setContributorName] = useState<string | undefined>();

  useEffect(() => {
    async function fetchName() {
      if (!challenge?.contributor) return;
      const name = await getUserNameByAddress(
        challenge.contributor as `0x${string}`
      );
      setContributorName(
        name && name !== challenge.contributor ? name : undefined
      );
    }

    fetchName();
  }, [challenge?.contributor]);

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
  if (!challenge) return null;

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">About challenge</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
          <div className="col-span-2 flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Contributor</span>
            <div className="flex items-center gap-1.5">
              <UserRoundPen className="h-full max-h-4 w-full max-w-4" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 text-slate-700 dark:text-slate-300 break-all cursor-pointer">
                      {contributorName || truncateAddress(challenge.contributor)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{challenge.contributor}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="p-0 h-6 w-6 opacity-80 hover:opacity-100"
                      onClick={() => copyToClipboard(challenge.contributor)}
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy address</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Domain</span>
            <div className="flex items-center gap-1.5">
              <Tag className="h-full max-h-4 w-full max-w-4" />
              <span className="ml-1">
                {DomainLabels[challenge.category as Domain]}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Quality Score</span>
            <div className="flex items-center gap-1.5">
              <Star className="h-full max-h-4 w-full max-w-4 text-amber-500 fill-current" />
              <span>{challenge.qualityScore ?? "--"} / 100</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Participants</span>
            <div className="flex items-center gap-1.5">
              <Users className="h-full max-h-4 w-full max-w-4" />
              <span>{challenge.participants} people</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Contributed date</span>
            <div className="flex items-center gap-1.5">
              <CalendarArrowUp className="h-full max-h-4 w-full max-w-4" />
              <span>{epochToDateString(challenge.contributeAt || 0)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Difficulty Level</span>
            <div className="flex items-center gap-1.5">
              <Badge
                className={cn(
                  "capitalize px-2 py-1 rounded-lg",
                  difficultyStyles[
                    challenge.difficultyLevel as keyof typeof difficultyStyles
                  ]
                )}
              >
                {
                  ChallengeDifficultyLevelLabels[
                    challenge.difficultyLevel as ChallengeDifficultyLevel
                  ]
                }
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Estimated solve time</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-full max-h-4 w-full max-w-4" />
              <span>{challenge.solveTime} minutes</span>
            </div>
          </div>
        </div>
      </div>
    );
}

