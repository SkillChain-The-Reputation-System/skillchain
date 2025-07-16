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
import { Button } from "./ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Copy, DollarSign, Users, Coins } from "lucide-react";
import {
  getChallengeTotalRevenue,
  getChallengeTalentPayment,
  getChallengeTalents,
} from "@/lib/get/get-challenge-cost-utils";
import { NATIVE_TOKEN_SYMBOL } from "@/constants/system";
import { toast } from "sonner";
import { getUserNameByAddress, getUserAvatarUrl } from "@/lib/get/get-user-data-utils";
import { cn } from "@/lib/utils";

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
  const [talentNames, setTalentNames] = useState<Record<string, string>>({});
  const [talentAvatars, setTalentAvatars] = useState<Record<string, string>>({});

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
          ts.map((t: string) =>
            getChallengeTalentPayment(challengeId, t as `0x${string}`)
          )
        );
        const map: Record<string, number> = {};
        ts.forEach((t: string, idx: number) => {
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

  useEffect(() => {
    async function fetchNamesAndAvatars() {
      const entries = await Promise.all(
        talents.map(async (t) => {
          const [name, avatarUrl] = await Promise.all([
            getUserNameByAddress(t as `0x${string}`),
            getUserAvatarUrl(t as `0x${string}`)
          ]);
          return { address: t, name, avatarUrl };
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
      
      setTalentNames(nameMap);
      setTalentAvatars(avatarMap);
    }

    if (talents.length > 0) {
      fetchNamesAndAvatars();
    } else {
      setTalentNames({});
      setTalentAvatars({});
    }
  }, [talents]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Revenue</h3>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-2 text-muted-foreground">Loading revenue data...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Total Revenue Summary */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
            <div className="flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-green-500" />
              <Badge variant="secondary" className="font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-300">
                {totalRevenue?.toFixed(4)} {NATIVE_TOKEN_SYMBOL}
              </Badge>
            </div>
          </div>

          {/* Talents Table */}
          {talents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Talent Payments</h4>
              </div>
              <div className="overflow-x-auto">
                <Table className="bg-transparent border-none">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Talent
                        </div>
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        <div className="flex items-center justify-end gap-2">
                          <Coins className="h-4 w-4 text-green-500" />
                          Payment
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {talents.map((talent, idx) => (
                      <TableRow key={talent} className="group bg-transparent border-none">
                        <TableCell className="font-medium bg-transparent border-none">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage 
                                src={talentAvatars[talent] || ""} 
                                alt={talentNames[talent] || "Unknown Talent"} 
                              />
                              <AvatarFallback>
                                {talentNames[talent] 
                                  ? talentNames[talent].split(" ").map((n) => n[0]).join("").toUpperCase() 
                                  : "UT"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="break-all text-sm group-hover:text-primary transition-colors cursor-pointer">
                                      {talentNames[talent] && talentNames[talent] !== talent
                                        ? talentNames[talent]
                                        : truncateAddress(talent)}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{talent}</p>
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
                                      onClick={() => copyToClipboard(talent, "Address")}
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
                          <Badge variant="secondary" className="font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900/20 dark:to-cyan-900/20 dark:text-blue-300">
                            {formatTokenAmount(`${payments[talent]} ${NATIVE_TOKEN_SYMBOL}`)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{talents.length} talent{talents.length !== 1 ? 's' : ''} paid</span>
                </div>
              </div>
            </div>
          )}

          {talents.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No talent payments recorded.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
