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
import { SolutionPotInfoInterface } from "@/lib/interfaces";
import { getSolutionPotInfo } from "@/lib/fetching-onchain-data-utils";
import { NATIVE_TOKEN_SYMBOL } from "@/constants/system";

const truncateAddress = (address: string): string => {
  if (!address || address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
};

const formatTokenAmount = (amount: string): string => {
  const cleanAmount = amount.replace(` ${NATIVE_TOKEN_SYMBOL}`, '');
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

interface SolutionPotInfoProps {
  solutionId: number;
}

export default function SolutionPotInfo({ solutionId }: SolutionPotInfoProps) {
  const [potInfo, setPotInfo] = useState<SolutionPotInfoInterface | null>(null);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const info = await getSolutionPotInfo(solutionId);
        setPotInfo(info);
      } catch (error) {
        console.error("Error fetching pot info:", error);
      }
    }
    fetchInfo();
  }, [solutionId]);

  return (
    <div className="py-4">
      <h3 className="font-bold mb-2 text-xl">Solution Pot</h3>
      <div className="text-sm flex flex-col gap-1 mb-2">
        <span>
          <span className="font-medium">Total Bounty:</span>{" "}
          {potInfo ? formatTokenAmount(`${potInfo.totalReward} ${NATIVE_TOKEN_SYMBOL}`) : "--"}
        </span>
        <span>
          <span className="font-medium">Solver Deposit:</span>{" "}
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
            <TableHead className="w-[180px]">Evaluator</TableHead>
            <TableHead className="text-right w-[120px]">Stake</TableHead>
            <TableHead className="text-right w-[120px]">Reward</TableHead>
            <TableHead className="text-right w-[120px]">Penalty</TableHead>
            <TableHead className="text-right w-[120px]">Remaining</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {potInfo?.evaluators.map((eva) => (
            <TableRow key={eva.evaluator}>
              <TableCell className="whitespace-nowrap overflow-hidden">
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate max-w-[120px] cursor-pointer">
                          {truncateAddress(eva.evaluator)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{eva.evaluator}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(eva.evaluator, "Address")}
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
                <span className="truncate block" title={`${eva.stake} ${NATIVE_TOKEN_SYMBOL}`}>
                  {formatTokenAmount(`${eva.stake} ${NATIVE_TOKEN_SYMBOL}`)}
                </span>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap overflow-hidden">
                <span className="truncate block" title={`${eva.reward} ${NATIVE_TOKEN_SYMBOL}`}>
                  {formatTokenAmount(`${eva.reward} ${NATIVE_TOKEN_SYMBOL}`)}
                </span>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap overflow-hidden">
                <span className="truncate block" title={`${eva.penalty} ${NATIVE_TOKEN_SYMBOL}`}>
                  {formatTokenAmount(`${eva.penalty} ${NATIVE_TOKEN_SYMBOL}`)}
                </span>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap overflow-hidden">
                <span className="truncate block" title={`${eva.remaining} ${NATIVE_TOKEN_SYMBOL}`}>
                  {formatTokenAmount(`${eva.remaining} ${NATIVE_TOKEN_SYMBOL}`)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {potInfo && potInfo.evaluators.length === 0 && (
          <TableCaption>No evaluators in this pot.</TableCaption>
        )}
      </Table>
    </div>
  );
}

