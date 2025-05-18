"use client";

import { useMemo } from 'react';
import { ModeratorReview } from '@/lib/interfaces';
import { User, Hash, Clock, Link2, CheckCircle, Star } from 'lucide-react';

interface ReviewDetailsProps {
  moderatorReview: ModeratorReview | null | undefined;
}

export function ReviewDetailsSection({ moderatorReview }: ReviewDetailsProps) {
  const detailRows = useMemo(() => [
    {
      icon: <User className="w-5 h-5 text-blue-500" />,
      label: "Moderator:",
      value: moderatorReview?.moderator || "-",
      title: moderatorReview?.moderator
    },
    {
      icon: <Hash className="w-5 h-5 text-green-500" />,
      label: "Challenge ID:",
      value: moderatorReview?.challenge_id ?? "-"
    },
    {
      icon: <Clock className="w-5 h-5 text-yellow-500" />,
      label: "Review Time:",
      value: moderatorReview?.review_time
        ? new Date(moderatorReview.review_time * 1000).toLocaleString()
        : "-"
    },
    {
      icon: <Link2 className="w-5 h-5 text-purple-500" />,
      label: "Review TxID:",
      value: moderatorReview?.review_txid || "-",
      title: moderatorReview?.review_txid
    },
    {
      icon: <CheckCircle 
              className={`w-5 h-5 ${
                moderatorReview?.is_submitted
                  ? "text-green-600"
                  : "text-gray-400"
              }`} 
            />,
      label: "Submitted:",
      value: moderatorReview?.is_submitted ? "Yes" : "No"
    },
    {
      icon: <Star className="w-5 h-5 text-orange-500" />,
      label: "Review Score:",
      value: moderatorReview?.review_score ?? "-"
    }
  ], [moderatorReview]);

  return (
    <div className="bg-muted/40 p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 gap-y-4">
        {detailRows.map((row, index) => (
          <div key={index} className="grid grid-cols-[32px_140px_1fr] items-center gap-x-2">
            {row.icon}
            <span className="font-semibold min-w-[120px]">
              {row.label}
            </span>
            <span
              className="truncate"
              title={row.title}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewDetailsSection;
