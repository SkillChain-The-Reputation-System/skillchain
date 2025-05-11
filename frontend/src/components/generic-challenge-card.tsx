"use client";

import { useEffect, useState, ReactNode } from "react";
import { toast } from "react-toastify";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/rich-text-editor";

import {
  Calendar,
  Tag,
  ArrowUpRight,
  Users,
  UserRoundPen,
  ShieldUser,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ChallengeInterface } from "@/lib/interfaces";
import {
  ChallengeStatus,
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

import { renderMathInElement } from "@/lib/katex-auto-render";
import "katex/dist/katex.min.css";

export interface ChallengeCardProps {
  reload?: boolean;
  challenge: ChallengeInterface;
  primaryButton: ReactNode;
  showStatus?: boolean;
  showContributor?: boolean;
  showModerators?: boolean;
  showCategory?: boolean;
  showCreatedDate?: boolean;
  showQualityScore?: boolean;
  showParticipants?: boolean;
  allowShowDetailDialog?: boolean;
}

export function GenericChallengeCard({
  reload,
  challenge,
  primaryButton,
  showStatus = true,
  showContributor = true,
  showModerators = true,
  showCategory = true,
  showCreatedDate = true,
  showQualityScore = true,
  showParticipants = true,
  allowShowDetailDialog = true,
}: ChallengeCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const formattedContributeDate = epochToDateString(challenge.contributeAt);
  const [poolSize, setPoolSize] = useState<number | null>(null);
  const [quorum, setQuorum] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPoolInfo() {
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
  }, [showDetails, challenge.id, reload]);

  return (
    <>
      <Card className="w-full h-full group gap-3 overflow-hidden bg-blue-100 dark:bg-blue-950/60 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg dark:hover:shadow-blue-900/20 border-transparent hover:border-blue-300 dark:hover:border-blue-700">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {challenge.title}
            </CardTitle>
            {showStatus && (
              <Badge
                className={cn(
                  "ml-2 font-normal capitalize",
                  statusStyles[challenge.status as keyof typeof statusStyles]
                )}
              >
                {
                  ChallengeStatusLabels[
                  challenge.status as keyof typeof ChallengeStatusLabels
                  ]
                }
              </Badge>
            )}
          </div>

          <div
            className="line-clamp-2 mt-1 text-muted-foreground text-sm"
            dangerouslySetInnerHTML={{ __html: challenge.description || "" }}
          />
        </CardHeader>

        <CardContent className="flex flex-col text-sm text-muted-foreground gap-2">
          {showContributor && (
            <div className="flex items-center gap-1">
              <UserRoundPen className="h-full max-h-3.5 w-full max-w-3.5" />
              <span>Contributor:</span>
              <span
                className="ml-1 text-blue-600 hover:text-blue-600/80 dark:text-blue-400 dark:hover:text-blue-400/80 cursor-pointer break-all"
                onClick={() =>
                  toast(`Redirect to user profile: ${challenge.contributor}`)
                }
              >
                {challenge.contributor}
              </span>
            </div>
          )}

          {showModerators && (
            <div className="flex items-center gap-1">
              <ShieldUser className="h-full max-h-3.5 w-full max-w-3.5" />
              <span>Moderators:</span>
              <span className="ml-1">
                {poolSize !== null && quorum !== null
                  ? `${poolSize} / ${quorum} joined`
                  : "Loading..."}
              </span>
            </div>
          )}

          {showCategory && (
            <div className="flex items-center gap-1">
              <Tag className="h-full max-h-3.5 w-full max-w-3.5" />
              <p>Domain:</p>
              <p className="ml-1">
                {DomainLabels[challenge.category as Domain]}
              </p>
            </div>
          )}

          <Separator className="my-1 bg-black" />

          <div className="flex items-center justify-between">
            {showCreatedDate && (
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Created on: {formattedContributeDate}
              </div>
            )}

            <div className="flex items-center gap-2">
              {showQualityScore && (
                <div className="flex items-center text-amber-500 dark:text-amber-400">
                  <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                  <span>{challenge.status == ChallengeStatus.APPROVED ? challenge.qualityScore : "--"}</span>
                </div>
              )}

              {showParticipants && (
                <div className="flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  <span>{0} joined</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between mt-2">
          <div>{primaryButton}</div>

          {allowShowDetailDialog && (
            <div
              className={cn(
                "flex items-center text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              )}
              onClick={() => setShowDetails(true)}
            >
              <span className="mr-1">Details</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Dialog pop ups when user click on challenge card */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between mt-3.5">
              <DialogTitle className="text-2xl font-bold">{challenge.title}</DialogTitle>
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
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Category
              </span>
              <span>
                {DomainLabels[challenge.category as Domain]}
              </span>
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
                <Calendar className="h-full max-h-3.5 w-full max-w-3.5 mr-1 text-muted-foreground" />
                <span>{formattedContributeDate}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Participants
              </span>
              <div className="flex items-center">
                <Users className="h-full max-h-3.5 w-full max-w-3.5 mr-1 text-muted-foreground" />
                <span>0 enrolled</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Moderators
              </span>
              <div className="flex items-center">
                <ShieldUser className="h-full max-h-3.5 w-full max-w-3.5 mr-1 text-muted-foreground" />
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
                  {challenge.status == ChallengeStatus.PENDING ? "--" : challenge.qualityScore}
                </span>
              </div>
            </div>
          </div>

          {challenge.description && (
            <>
              <Separator />
              <div className="py-4">
                <h3 className="font-bold mb-2 text-xl">Challenge Details</h3>
                <RichTextEditor value={challenge.description} editable={false} />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDetails(false)} className="bg-gray-300">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
