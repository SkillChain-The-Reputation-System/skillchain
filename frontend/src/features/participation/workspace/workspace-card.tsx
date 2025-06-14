// Import UI components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Import lucide-react icons
import {
  CalendarPlus2,
  Tag,
  Trophy,
} from "lucide-react";

// Import utils
import {
  Domain,
  DomainLabels,
  ChallengeSolutionProgress,
  ChallengeSolutionProgressLabels,
} from "@/constants/system";
import { solutionProgressStyles } from "@/constants/styles";
import { BriefJoinedChallenge } from "@/lib/interfaces";
import { epochToDateTimeString } from "@/lib/time-utils";
import { cn } from "@/lib/utils";

export interface WorkspaceCardProps {
  joinedChallenge: BriefJoinedChallenge;
  onClick: (challengeId: `0x${string}`) => void;
}

export function WorkspaceCard({ joinedChallenge, onClick }: WorkspaceCardProps) {
  const formattedJoinedDate = epochToDateTimeString(joinedChallenge.joinedAt);

  return (
    <>
      <Card
        className="w-full h-full group gap-2 overflow-hidden bg-blue-100 dark:bg-blue-950/60 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-blue-900/20 border-transparent hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer select-none"
        onClick={() => onClick(joinedChallenge.challengeId)}>
        <CardHeader>
          <div className="flex justify-between items-baseline">
            <CardTitle className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 wrap-anywhere">
              <p className="text-normal font-bold leading-6">{joinedChallenge.title}</p>
            </CardTitle>

            <Badge className={cn(
              "text-[11px]",
              solutionProgressStyles[joinedChallenge.progress as keyof typeof solutionProgressStyles]
            )}
            >
              {
                ChallengeSolutionProgressLabels[
                joinedChallenge.progress as keyof typeof ChallengeSolutionProgressLabels
                ]
              }
            </Badge>
          </div>

          <div
            className="line-clamp-2 text-muted-foreground text-xs font-light disable-click-links no-images break-all"
            dangerouslySetInnerHTML={{ __html: joinedChallenge.description || "" }}
          />
        </CardHeader>

        <CardContent className="flex flex-col text-[12px] text-muted-foreground gap-2">
          <div className="flex items-center gap-1">
            <Tag className="h-full max-h-3.5 max-w-3.5 w-full " />
            <p className="ml-1">
              {DomainLabels[joinedChallenge.category as Domain]}
            </p>
          </div>

          <Separator className="my-1 bg-black dark:bg-slate-400" />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarPlus2 className="h-full max-h-3.5 max-w-3.5 w-full mr-1" />
              <p className="ml-1">Joined on {formattedJoinedDate}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500 dark:text-amber-400">
                <Trophy className="h-full max-h-3.5 max-w-3.5 w-full mr-1 fill-current" />
                <span>{joinedChallenge.progress == ChallengeSolutionProgress.REVIEWED ? joinedChallenge.score : "--"}</span>
              </div>

              {/* Display more details */}
            </div>
          </div>
        </CardContent>
      </Card >
    </>
  );
}
