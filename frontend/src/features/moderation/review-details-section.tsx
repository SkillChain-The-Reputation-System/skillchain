"use client";

import { useEffect, useMemo, useState } from "react";
import { ModeratorReview } from "@/lib/interfaces";
import { User, Hash, Clock, CheckCircle, Star, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { getUserNameByAddress } from "@/lib/get/get-user-data-utils";

interface ReviewDetailsProps {
  moderatorReview: ModeratorReview | null | undefined;
  challengeId: `0x${string}`;
}

export default function ReviewDetailsSection({ moderatorReview, challengeId }: ReviewDetailsProps) {
  const [moderatorName, setModeratorName] = useState<string | undefined>();

  useEffect(() => {
    async function fetchName() {
      if (!moderatorReview?.moderator) return;
      const name = await getUserNameByAddress(
        moderatorReview.moderator as `0x${string}`
      );
      setModeratorName(
        name && name !== moderatorReview.moderator ? name : undefined
      );
    }

    fetchName();
  }, [moderatorReview?.moderator]);

  const truncate = (str: string): string => {
    if (!str || str.length <= 16) return str;
    return `${str.slice(0, 8)}...${str.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Address copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  const details = useMemo(
    () => [
      {
        icon: <User className="h-full max-h-4 w-full max-w-4" />,
        label: "Moderator",
        value: moderatorName || truncate(moderatorReview?.moderator ?? "-"),
        raw: moderatorReview?.moderator ?? "-",
        copy: true,
      },
      {
        icon: <Hash className="h-full max-h-4 w-full max-w-4" />,
        label: "Challenge ID",
        value: truncate(challengeId),
        raw: challengeId,
      },
      {
        icon: <Clock className="h-full max-h-4 w-full max-w-4" />,
        label: "Review Time",
        value: moderatorReview?.review_time
          ? new Date(moderatorReview.review_time * 1000).toLocaleString()
          : "-",
      },
      {
        icon: (
          <CheckCircle
            className={
              moderatorReview?.is_submitted
                ? "h-full max-h-4 w-full max-w-4 text-green-600"
                : "h-full max-h-4 w-full max-w-4 text-gray-400"
            }
          />
        ),
        label: "Submitted",
        value: moderatorReview?.is_submitted ? "Yes" : "No",
      },
      {
        icon: <Star className="h-full max-h-4 w-full max-w-4 text-amber-500 fill-current" />,
        label: "Review Score",
        value: moderatorReview?.review_score ?? "-",
      },
    ],
    [moderatorReview, moderatorName, challengeId]
  );

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700 space-y-4">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Review Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
        {details.map((row, idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">{row.label}</span>
            <div className="flex items-center gap-1.5">
              {row.icon}
              {row.raw ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="break-all cursor-pointer">{row.value}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{row.raw}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="break-all">{row.value}</span>
              )}
              {row.copy && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="p-0 h-6 w-6 opacity-80 hover:opacity-100"
                        onClick={() => copyToClipboard(row.raw as string)}
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy address</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
