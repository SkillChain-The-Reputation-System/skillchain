"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, UserCheck, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
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
import { getUserNameByAddress, getUserAvatarUrl } from "@/lib/get/get-user-data-utils";
import { cn } from "@/lib/utils";

interface ModerationDetailsProps {
  challenge: ChallengeInterface;
}

interface ModeratorInfo {
  moderator: string;
  score: number;
  reputation?: number;
  deviation?: number;
  name?: string;
  avatarUrl?: string;
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
                [reputation, deviation] = await Promise.all([
                  getUserDomainReputationScore(
                    mod.moderator as `0x${string}`,
                    challenge.category as Domain
                  ),
                  getScoreDeviationOfModeratorReview(
                    challenge.id,
                    mod.moderator as `0x${string}`
                  )
                ]);
              } catch (err) {
                console.error("Error fetching reputation:", err);
              }
            }
            
            // Fetch name and avatar
            const [name, avatarUrl] = await Promise.all([
              getUserNameByAddress(mod.moderator as `0x${string}`),
              getUserAvatarUrl(mod.moderator as `0x${string}`)
            ]);
            
            return {
              moderator: mod.moderator,
              score: review?.review_score ?? 0,
              reputation,
              deviation,
              name: name && name !== mod.moderator ? name : undefined,
              avatarUrl: avatarUrl || undefined,
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
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Moderation Details</h3>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-muted-foreground">Loading moderation data...</span>
        </div>
      ) : moderators.length > 0 ? (
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge className={cn(
              "text-xs font-semibold px-3 py-1 rounded-lg",
              isFinalized 
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" 
                : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
            )}>
              {isFinalized ? "Finalized" : "In Progress"}
            </Badge>
          </div>
          
          {/* Moderators Table */}
          <div className="overflow-x-auto">
            <Table className="bg-transparent border-none">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Moderator
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      Score
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Domain Rep.
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    <div className="flex items-center justify-end gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Deviation
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moderators.map((mod, idx) => (
                  <TableRow key={mod.moderator} className="group bg-transparent border-none">
                    <TableCell className="font-medium bg-transparent border-none">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={mod.avatarUrl || ""} 
                            alt={mod.name || "Unknown Moderator"} 
                          />
                          <AvatarFallback>
                            {mod.name 
                              ? mod.name.split(" ").map((n) => n[0]).join("").toUpperCase() 
                              : "UM"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="break-all text-sm group-hover:text-primary transition-colors cursor-pointer">
                                  {mod.name || truncateAddress(mod.moderator)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{mod.moderator}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => copyToClipboard(mod.moderator)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy address</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center bg-transparent border-none">
                      <Badge variant="secondary" className="font-semibold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 dark:from-amber-900/20 dark:to-yellow-900/20 dark:text-amber-300">
                        {mod.score}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center bg-transparent border-none">
                      {isFinalized ? (
                        mod.reputation !== undefined ? (
                          <Badge variant="secondary" className="font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300">
                            {mod.reputation}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">--</span>
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right bg-transparent border-none">
                      <div className="flex items-center justify-end gap-1">
                        {isFinalized ? (
                          mod.deviation !== undefined ? (
                            <>
                              {mod.deviation > 0 ? (
                                <TrendingUp className="h-3 w-3 text-red-500" />
                              ) : mod.deviation < 0 ? (
                                <TrendingDown className="h-3 w-3 text-green-500" />
                              ) : (
                                <Minus className="h-3 w-3 text-gray-500" />
                              )}
                              <span className={cn(
                                "text-sm font-medium",
                                mod.deviation > 0 ? "text-red-600 dark:text-red-400" :
                                  mod.deviation < 0 ? "text-green-600 dark:text-green-400" :
                                    "text-gray-600 dark:text-gray-400"
                              )}>
                                {mod.deviation > 0 ? "+" : ""}{mod.deviation}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">--</span>
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Footer with legend and stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-red-500" />
                <span>Above average</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-green-500" />
                <span>Below average</span>
              </div>
              <div className="flex items-center gap-1">
                <Minus className="h-3 w-3 text-gray-500" />
                <span>At average</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              <span>{moderators.length} moderator{moderators.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {!isFinalized && (
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <p className="text-xs text-orange-800 dark:text-orange-300">
                <strong>Note:</strong> Domain reputation and deviation data will be available after challenge finalization.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No moderation data available.</p>
        </div>
      )}
    </div>
  );
}

export default ModerationDetails;
