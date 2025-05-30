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
  CalendarDays,
  Check,
  Eye,
  Tag,
  UserRoundPen,
  LoaderCircle
} from "lucide-react";

// Import utils
import { UnderReviewSolutionPreview } from "@/lib/interfaces";
import {
  ChallengeSolutionProgress,
  Domain,
  DomainLabels,
} from "@/constants/system";
import { epochToDateTimeString } from "@/lib/time-utils";

interface SolutionCardProps {
  solutionPreview: UnderReviewSolutionPreview;
  onClick: (id: string) => void;
  forEvaluator?: boolean
}

export function SolutionCard({ solutionPreview, onClick, forEvaluator = false }: SolutionCardProps) {
  const submittedDate = epochToDateTimeString(solutionPreview.submittedAt);

  return (
    <>
      <Card
        className="w-full h-full group gap-2 overflow-hidden bg-blue-100 dark:bg-blue-950/60 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-blue-900/20 border-transparent hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer select-none"
        onClick={() => onClick(solutionPreview.solutionId)}
      >
        <CardHeader>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <CardTitle className="text-sm font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 wrap-anywhere">
                {solutionPreview.challengeTitle}
              </CardTitle>

              {
                forEvaluator && (
                  solutionPreview.progress == ChallengeSolutionProgress.UNDER_REVIEW ?
                    <LoaderCircle className="h-full max-h-5.5 w-full max-w-5.5 text-yellow-500 animate-spin duration-2500" />
                    :
                    <Check className="h-full max-h-5.5 w-full max-w-5.5 text-green-600" />
                )
              }
            </div>
          </div>

          <div
            className="line-clamp-1 mt-1 text-muted-foreground text-xs font-light disable-click-links no-images break-all"
            dangerouslySetInnerHTML={{ __html: solutionPreview.solution || "" }}
          />
        </CardHeader>

        <CardContent className="flex flex-col text-[11px] text-muted-foreground gap-2">
          <div className="flex items-center gap-1">
            <UserRoundPen className="h-full max-h-3.5 w-full max-w-3.5" />
            <span>By</span>
            <span className="ml-1 text-indigo-800 dark:text-indigo-300 break-all">
              {solutionPreview.submitter}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Tag className="h-full max-h-3.5 w-full max-w-3.5" />
            <p className="ml-1">
              {DomainLabels[solutionPreview.category as Domain]}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <CalendarDays className="h-full max-h-3.5 w-full max-w-3.5 mr-1" />
            <span>Submitted {submittedDate}</span>
          </div>

          <Separator className="my-1 bg-black dark:bg-slate-400" />

          <div className="flex items-center">
            <Eye className="h-full max-h-3.5 w-full max-w-3.5 mr-1" />
            <span>
              {solutionPreview.numberOfEvaluators} / {solutionPreview.totalEvaluators} Evaluators
            </span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}