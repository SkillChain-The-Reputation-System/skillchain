"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Import UI components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Import icons
import {
  Calendar,
  Clock,
  Users,
  ShieldUser,
} from "lucide-react";

// Import utils and constants
import { cn } from "@/lib/utils";
import { ChallengeInterface } from "@/lib/interfaces";
import {
  ChallengeStatusLabels,
  Domain,
  DomainLabels,
} from "@/constants/system";
import { statusStyles } from "@/constants/styles";
import { epochToDateString } from "@/lib/time-utils";
import {
  getReviewPoolSize,
  getReviewQuorum,
} from "@/lib/fetching-onchain-data-utils";

interface ChallengeContentProps {
  challenge: ChallengeInterface | null;
  reload?: boolean;
  className?: string; // Add className prop for styling
}

export function ChallengeContent({ challenge, reload, className }: ChallengeContentProps) {
  const [poolSize, setPoolSize] = useState<number | null>(null);
  const [quorum, setQuorum] = useState<number | null>(null);

  const createdOnDate = challenge?.contributeAt
    ? epochToDateString(challenge.contributeAt)
    : "N/A";

  useEffect(() => {
    async function fetchPoolInfo() {
      if (!challenge) return;

      try {
        const [size, q] = await Promise.all([
          getReviewPoolSize(Number(challenge.id)),
          getReviewQuorum(),
        ]);
        setPoolSize(size);
        setQuorum(q);
      } catch (error) {
        toast.error(`Error fetching review pool info: ${error}`);
      }
    }
    fetchPoolInfo();
  }, [challenge, reload]);

  if (!challenge) return null;
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between mt-3.5">
          <CardTitle className="text-2xl">{challenge.title}</CardTitle>
          <Badge
            className={cn(
              "font-normal capitalize",
              statusStyles[challenge.status as keyof typeof statusStyles]
            )}
          >
            {
              ChallengeStatusLabels[
              challenge.status as keyof typeof ChallengeStatusLabels
              ]
            }
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Category
            </span>
            <Badge variant="outline" className="w-fit">
              {DomainLabels[challenge?.category as Domain]}
            </Badge>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Contribution fee
            </span>
            <span>0 ETHs</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Created On
            </span>
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span>{createdOnDate}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Participants
            </span>
            <div className="flex items-center">
              <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span>{challenge.completed} completed</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Moderators
            </span>
            <div className="flex items-center">
              <ShieldUser className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span>
                {poolSize !== null && quorum !== null
                  ? `${poolSize} / ${quorum} joined`
                  : "Loading..."}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Quality Score
            </span>
            <div className="flex items-center">
              <span>
                {challenge.qualityScore || "Not rated yet"}
              </span>
            </div>
          </div>
        </div>

        {challenge?.description && (
          <>
            <Separator />
            <div className="py-4">
              <h3 className="font-medium mb-2">Challenge Details</h3>
              <div
                className="text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: challenge.description,
                }}
              ></div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}