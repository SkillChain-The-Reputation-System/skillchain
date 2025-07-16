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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Coins, UserRoundPen } from "lucide-react";
import { toast } from "sonner";
import { ChallengePotInfoInterface } from "@/lib/interfaces";
import { getChallengePotInfo } from "@/lib/fetching-onchain-data-utils";
import { NATIVE_TOKEN_SYMBOL } from "@/constants/system";
import { getUserNameByAddress, getUserAvatarUrl } from "@/lib/get/get-user-data-utils";
import { cn } from "@/lib/utils";

// Utility functions for truncation and formatting
const truncateAddress = (address: string): string => {
  if (!address || address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
};

const formatTokenAmount = (amount: string): string => {
  // Remove ETH suffix for processing
  const cleanAmount = amount.replace(` ${NATIVE_TOKEN_SYMBOL}`, '');
  
  // If the number is very long, truncate it but keep some precision
  if (cleanAmount.length > 10) {
    const num = parseFloat(cleanAmount);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M ${NATIVE_TOKEN_SYMBOL}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K ${NATIVE_TOKEN_SYMBOL}`;
    } else {
      return `${num.toFixed(4)} ${NATIVE_TOKEN_SYMBOL}`;
    }
  }
  
  return `${cleanAmount} ${NATIVE_TOKEN_SYMBOL}`;
};

const copyToClipboard = async (text: string, type: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  } catch (error) {
    toast.error(`Failed to copy ${type.toLowerCase()}`);
  }
};

interface ChallengePotInfoProps {
  challengeId: `0x${string}`;
}

export function ChallengePotInfo({ challengeId }: ChallengePotInfoProps) {
  const [potInfo, setPotInfo] = useState<ChallengePotInfoInterface | null>(null);
  const [moderatorNames, setModeratorNames] = useState<Record<string, string>>({});
  const [moderatorAvatars, setModeratorAvatars] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchInfo() {
      try {
        const info = await getChallengePotInfo(challengeId);
        setPotInfo(info);
        
        // Fetch names and avatars for moderators
        const entries = await Promise.all(
          info.moderators.map(async (m) => {
            const [name, avatarUrl] = await Promise.all([
              getUserNameByAddress(m.moderator as `0x${string}`),
              getUserAvatarUrl(m.moderator as `0x${string}`)
            ]);
            return { address: m.moderator, name, avatarUrl };
          })
        );
        
        const nameMap: Record<string, string> = {};
        const avatarMap: Record<string, string> = {};
        
        entries.forEach(({ address, name, avatarUrl }) => {
          if (name && name !== address) {
            nameMap[address] = name;
          }
          if (avatarUrl) {
            avatarMap[address] = avatarUrl;
          }
        });
        
        setModeratorNames(nameMap);
        setModeratorAvatars(avatarMap);
      } catch (error) {
        console.error("Error fetching pot info:", error);
      }
    }
    fetchInfo();
  }, [challengeId]);
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Challenge Pot</h3>
      </div>
      
      {/* Pot Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">Total Bounty</span>
          <div className="flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-amber-500" />
            <Badge variant="secondary" className="font-semibold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 dark:from-amber-900/20 dark:to-yellow-900/20 dark:text-amber-300">
              {potInfo ? formatTokenAmount(`${potInfo.totalReward} ${NATIVE_TOKEN_SYMBOL}`) : "--"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">Status</span>
          <div className="flex items-center gap-1.5">
            <Badge className={cn(
              "text-xs font-semibold px-2 py-1 rounded-lg",
              potInfo?.isFinalized 
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" 
                : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
            )}>
              {potInfo ? (potInfo.isFinalized ? "Finalized" : "Pending") : "--"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Moderators Table */}
      {potInfo && potInfo.moderators.length > 0 && (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <Table className="bg-transparent border-none">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-2">
                      <UserRoundPen className="h-4 w-4" />
                      Moderator
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    <div className="flex items-center justify-end gap-2">
                      <Coins className="h-4 w-4 text-amber-500" />
                      Reward
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {potInfo.moderators.map((mod, idx) => (
                  <TableRow key={mod.moderator} className="group bg-transparent border-none">
                    <TableCell className="font-medium bg-transparent border-none">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={moderatorAvatars[mod.moderator] || ""} 
                            alt={moderatorNames[mod.moderator] || "Unknown Moderator"} 
                          />
                          <AvatarFallback>
                            {moderatorNames[mod.moderator] 
                              ? moderatorNames[mod.moderator].split(" ").map((n) => n[0]).join("").toUpperCase() 
                              : "UM"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="break-all text-sm group-hover:text-primary transition-colors cursor-pointer">
                                  {moderatorNames[mod.moderator] && moderatorNames[mod.moderator] !== mod.moderator
                                    ? moderatorNames[mod.moderator]
                                    : truncateAddress(mod.moderator)}
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
                                  onClick={() => copyToClipboard(mod.moderator, "Address")}
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
                    <TableCell className="text-right bg-transparent border-none">
                      <Badge variant="secondary" className="font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-300">
                        {formatTokenAmount(`${mod.reward} ${NATIVE_TOKEN_SYMBOL}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-1">
              <UserRoundPen className="h-3 w-3" />
              <span>{potInfo.moderators.length} moderator{potInfo.moderators.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}

      {potInfo && potInfo.moderators.length === 0 && (
        <div className="text-center py-8">
          <UserRoundPen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No moderators in this pot.</p>
        </div>
      )}
    </div>
  );
}
