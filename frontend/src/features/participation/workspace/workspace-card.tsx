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
  CalendarCheck,
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
import { JoinedChallengePreview } from "@/lib/interfaces";
import { epochToDateString } from "@/lib/time-utils";
import { cn } from "@/lib/utils";

export interface WorkspaceCardProps {
  previewChallenge: JoinedChallengePreview;
  onClick: (id: string) => void;
}

export function WorkspaceCard({ previewChallenge, onClick }: WorkspaceCardProps) {
  const formattedJoinedDate = epochToDateString(previewChallenge.joinedAt);

  return (
    <>
      <Card
        className="w-full h-full group gap-2 overflow-hidden bg-blue-100 dark:bg-blue-950/60 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg dark:hover:shadow-blue-900/20 border-transparent hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer select-none"
        onClick={() => onClick(previewChallenge.challengeId)}>
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <p className="text-normal font-bold leading-6">{previewChallenge.title}</p>
            </CardTitle>

            <Badge className={cn(
              "text-[11px]",
              solutionProgressStyles[previewChallenge.progress as keyof typeof solutionProgressStyles]
            )}
            >
              {
                ChallengeSolutionProgressLabels[
                previewChallenge.progress as keyof typeof ChallengeSolutionProgressLabels
                ]
              }
            </Badge>
          </div>

          <div
            className="line-clamp-2 text-muted-foreground text-xs font-light disable-click-links no-images"
            dangerouslySetInnerHTML={{ __html: previewChallenge.description || "" }}
          />
        </CardHeader>

        <CardContent className="flex flex-col text-[12px] text-muted-foreground gap-2">
          <div className="flex items-center gap-1">
            <Tag className="h-full max-h-3.5 max-w-3.5 w-full " />
            <p className="ml-1">
              {DomainLabels[previewChallenge.category as Domain]}
            </p>
          </div>

          <Separator className="my-1 bg-black dark:bg-slate-400" />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarCheck className="h-full max-h-3.5 max-w-3.5 w-full mr-1" />
              <p className="ml-1">Joined at {formattedJoinedDate}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500 dark:text-amber-400">
                <Trophy className="h-full max-h-3.5 max-w-3.5 w-full mr-1 fill-current" />
                <span>{previewChallenge.progress == ChallengeSolutionProgress.REVIEWED ? previewChallenge.score : "--"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card >
    </>
  );
}
