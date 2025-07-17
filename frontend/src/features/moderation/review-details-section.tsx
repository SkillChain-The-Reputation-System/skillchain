"use client";

import { useMemo } from "react";
import { ModeratorReview } from "@/lib/interfaces";
import { User, Hash, Clock, Link2, CheckCircle, Star } from "lucide-react";

interface ReviewDetailsProps {
  moderatorReview: ModeratorReview | null | undefined;
}

export default function ReviewDetailsSection({ moderatorReview }: ReviewDetailsProps) {
  const details = useMemo(
    () => [
      {
        icon: <User className="h-full max-h-4 w-full max-w-4" />,
        label: "Moderator",
        value: moderatorReview?.moderator ?? "-",
      },
      {
        icon: <Hash className="h-full max-h-4 w-full max-w-4" />,
        label: "Challenge ID",
        value: moderatorReview?.challenge_id ?? "-",
      },
      {
        icon: <Clock className="h-full max-h-4 w-full max-w-4" />,
        label: "Review Time",
        value: moderatorReview?.review_time
          ? new Date(moderatorReview.review_time * 1000).toLocaleString()
          : "-",
      },
      {
        icon: <Link2 className="h-full max-h-4 w-full max-w-4" />,
        label: "Review TxID",
        value: moderatorReview?.review_txid ?? "-",
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
    [moderatorReview]
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
              <span className="break-all">{row.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
