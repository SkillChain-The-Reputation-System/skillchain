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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { ChallengePotInfoInterface } from "@/lib/interfaces";
import { getChallengePotInfo } from "@/lib/fetching-onchain-data-utils";
import { NATIVE_TOKEN_SYMBOL } from "@/constants/system";
import { getUserNameByAddress } from "@/lib/get/get-user-data-utils";

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

  useEffect(() => {
    async function fetchInfo() {
      try {
        const info = await getChallengePotInfo(challengeId);
        setPotInfo(info);
        const entries = await Promise.all(
          info.moderators.map(async (m) => [
            m.moderator,
            await getUserNameByAddress(m.moderator as `0x${string}`),
          ])
        );
        const map: Record<string, string> = {};
        entries.forEach(([a, n]) => {
          if (n && n !== a) {
            map[a] = n as string;
          }
        });
        setModeratorNames(map);
      } catch (error) {
        console.error("Error fetching pot info:", error);
      }
    }
    fetchInfo();
  }, [challengeId]);
  return (
    <div className="py-4">
      <h3 className="font-bold mb-2 text-xl">Challenge Pot</h3>
      <div className="text-sm flex flex-col gap-1 mb-2">
        <span>
          <span className="font-medium">Total Bounty:</span>{" "}
          {potInfo ? formatTokenAmount(`${potInfo.totalReward} ${NATIVE_TOKEN_SYMBOL}`) : "--"}
        </span>
        <span>
          <span className="font-medium">Contributor Deposit:</span>{" "}
          {potInfo ? formatTokenAmount(`${potInfo.bounty} ${NATIVE_TOKEN_SYMBOL}`) : "--"}
        </span>
        <span>
          <span className="font-medium">Status:</span>{" "}
          {potInfo ? (potInfo.isFinalized ? "Finalized" : "Pending") : "--"}
        </span>
      </div>
      <Separator className="my-2" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-auto">Moderator</TableHead>
            <TableHead className="text-right w-auto">Reward</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {potInfo?.moderators.map((mod) => (
            <TableRow key={mod.moderator}>
              <TableCell className="whitespace-nowrap overflow-hidden">
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate w-auto cursor-pointer">
                          {moderatorNames[mod.moderator] &&
                          moderatorNames[mod.moderator] !== mod.moderator
                            ? moderatorNames[mod.moderator]
                            : truncateAddress(mod.moderator)}
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
                          onClick={() => copyToClipboard(mod.moderator, "Address")}
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
              <TableCell className="text-right whitespace-nowrap overflow-hidden">
                <span className="truncate block w-auto" title={`${mod.reward} ${NATIVE_TOKEN_SYMBOL}`}>
                  {formatTokenAmount(`${mod.reward} ${NATIVE_TOKEN_SYMBOL}`)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {potInfo && potInfo.moderators.length === 0 && (
          <TableCaption>No moderators in this pot.</TableCaption>
        )}
      </Table>
    </div>
  );
}
