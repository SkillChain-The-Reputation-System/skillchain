"use client";

// Import UI components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Import ludide-react icons
import {
  CalendarArrowUp,
  Tag,
  Users,
  UserRoundPen,
  Star,
} from "lucide-react";

// Import utils
import { ChallengeInterface } from "@/lib/interfaces";
import { getUserNameByAddress } from "@/lib/get/get-user-data-utils";
import { useEffect, useState } from "react";
import {
  ChallengeStatus,
  Domain,
  DomainLabels,
} from "@/constants/system";
import { epochToDateString } from "@/lib/time-utils";

interface ChallengeCardProps {
  challenge: ChallengeInterface;
  onClick: (id: `0x${string}`) => void;
}

export function ChallengeCard({ challenge, onClick }: ChallengeCardProps) {
  const [contributorName, setContributorName] = useState<string | undefined>();
  const formattedContributeDate = epochToDateString(challenge.contributeAt || 0);

  useEffect(() => {
    async function fetchContributorName() {
      const name = await getUserNameByAddress(challenge.contributor);
      if (name && name !== challenge.contributor) {
        setContributorName(name);
      } else {
        setContributorName(undefined);
      }
    }

    fetchContributorName();
  }, [challenge.contributor]);

  return (

    <Card
      className="w-full h-full group gap-2 overflow-hidden bg-blue-100 dark:bg-blue-950/60 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-blue-900/20 border-transparent hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer select-none"
      onClick={() => onClick(challenge.id)}>
      <CardHeader>
        <div className="space-y-1.5">
          <CardTitle className="text-sm font-bold line-clamp-2 wrap-anywhere">
            {challenge.title}
          </CardTitle>
        </div>

        <div
          className="line-clamp-2 mt-1 text-muted-foreground text-xs font-light disable-click-links no-images break-all"
          dangerouslySetInnerHTML={{ __html: challenge.description || "" }}
        />
      </CardHeader>

      <CardContent className="flex flex-col text-[11px] text-muted-foreground gap-2">
        <div className="flex items-center gap-1">
          <UserRoundPen className="h-full max-h-3.5 w-full max-w-3.5" />
          <span>By:</span>
          <span className="ml-1 text-indigo-800 dark:text-indigo-300 break-all">
            {contributorName ?? challenge.contributor}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Tag className="h-full max-h-3.5 w-full max-w-3.5" />
          <p className="ml-1">
            {DomainLabels[challenge.category as Domain]}
          </p>
        </div>

        <Separator className="my-1 bg-black dark:bg-slate-400" />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarArrowUp className="h-full max-h-3.5 w-full max-w-3.5 mr-1" />
            {formattedContributeDate}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-500 dark:text-amber-400">
              <Star className="h-full max-h-3.5 w-full max-w-3.5 mr-1 fill-current" />
              <span>{challenge.status == ChallengeStatus.APPROVED ? challenge.qualityScore : "--"}</span>
            </div>

            {/* <div className="flex items-center">
                <Users className="h-full max-h-3.5 w-full max-w-3.5 mr-1" />
                <span>{challenge.participants} people</span>
              </div> */}
          </div>
        </div>
      </CardContent>
    </Card >

  );
}
