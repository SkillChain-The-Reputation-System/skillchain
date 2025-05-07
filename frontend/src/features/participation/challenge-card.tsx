import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  Calendar,
  Tag,
  Users,
  UserRoundPen,
  Star,
} from "lucide-react";

import { ChallengeInterface } from "@/lib/interfaces";
import {
  ChallengeStatus,
  Domain,
  DomainLabels,
} from "@/constants/system";
import { epochToDateString } from "@/lib/time-utils";
export interface ChallengeCardProps {
  challenge: ChallengeInterface;
  onClick: (id: string) => void
}

export function ChallengeCard({ challenge, onClick }: ChallengeCardProps) {
  const formattedContributeDate = epochToDateString(challenge.contributeAt);

  return (
    <>
      <Card
        className="w-full h-full group gap-2 overflow-hidden bg-blue-100 dark:bg-blue-950/60 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg dark:hover:shadow-blue-900/20 border-transparent hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer select-none"
        onClick={() => onClick(challenge.id!)}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {challenge.title}
            </CardTitle>
          </div>

          <div
            className="line-clamp-2 mt-1 text-muted-foreground text-xs font-light disable-click-links"
            dangerouslySetInnerHTML={{ __html: challenge.description || "" }}
          />
        </CardHeader>

        <CardContent className="flex flex-col text-[11px] text-muted-foreground gap-2">
          <div className="flex items-center gap-1">
            <UserRoundPen className="h-full max-h-3.5 w-full max-w-3.5" />
            <span>By:</span>
            <span className="ml-1 text-indigo-800 dark:text-indigo-300 break-all">
              {challenge.contributor}
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
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {formattedContributeDate}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500 dark:text-amber-400">
                <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                <span>{challenge.status == ChallengeStatus.APPROVED ? challenge.qualityScore : "--"}</span>
              </div>

              <div className="flex items-center">
                <Users className="h-3.5 w-3.5 mr-1" />
                <span>{0} joined</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
