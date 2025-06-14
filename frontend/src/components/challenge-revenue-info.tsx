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
import {
  getChallengeTotalRevenue,
  getChallengeTalentPayment,
  getChallengeTalents,
} from "@/lib/get/get-challenge-cost-utils";
import { NATIVE_TOKEN_SYMBOL } from "@/constants/system";
import { toast } from "react-toastify";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ChallengeRevenueInfoProps {
  challengeId: `0x${string}`;
}

// Utility functions for truncation and formatting
const truncateAddress = (address: string): string => {
  if (!address || address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
};

const formatTokenAmount = (amount: string): string => {
  // Remove ETH suffix for processing
  const cleanAmount = amount.replace(` ${NATIVE_TOKEN_SYMBOL}`, "");

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

export function ChallengeRevenueInfo({
  challengeId,
}: ChallengeRevenueInfoProps) {
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [talents, setTalents] = useState<string[]>([]);
  const [payments, setPayments] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        setLoading(true);
        const [revenue, ts] = await Promise.all([
          getChallengeTotalRevenue(challengeId),
          getChallengeTalents(challengeId),
        ]);
        setTotalRevenue(revenue);
        setTalents(ts);
        const paymentValues = await Promise.all(
          ts.map((t) =>
            getChallengeTalentPayment(challengeId, t as `0x${string}`)
          )
        );
        const map: Record<string, number> = {};
        ts.forEach((t, idx) => {
          map[t] = paymentValues[idx];
        });
        setPayments(map);
      } catch (err) {
        console.error("Error fetching challenge revenue info:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRevenue();
  }, [challengeId]);

  return (
    <div className="py-4">
      <h3 className="font-bold mb-2 text-xl">Revenue</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="text-sm flex flex-col gap-1 mb-2">
          <p className="mb-2">
            Total Revenue: {totalRevenue?.toFixed(4)} {NATIVE_TOKEN_SYMBOL}
          </p>
          <Separator className="my-2" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Talent</TableHead>
                <TableHead className="text-right">Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {talents.map((talent) => (
                <TableRow key={talent}>
                  <TableCell className="truncate max-w-[120px] cursor-pointer">
                    <TooltipProvider>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[120px] cursor-pointer">
                              {truncateAddress(talent)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{talent}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(talent, "Address")}
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
                    <span
                      className="truncate block"
                      title={`${payments[talent]} ${NATIVE_TOKEN_SYMBOL}`}
                    >
                      {formatTokenAmount(
                        `${payments[talent]} ${NATIVE_TOKEN_SYMBOL}`
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {talents.length === 0 && (
              <TableCaption>No talent payments.</TableCaption>
            )}
          </Table>
        </div>
      )}
    </div>
  );
}
