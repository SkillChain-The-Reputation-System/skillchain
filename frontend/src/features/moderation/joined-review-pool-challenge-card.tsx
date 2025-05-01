"use client";

// Import hooks
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Import UI components
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

// Import Lucide-react Icons
import {
  Calendar,
  Tag,
  ArrowUpRight,
  Clock,
  Users,
  UserRoundPen,
  ShieldUser,
} from "lucide-react";

// Import utils
import { cn } from "@/lib/utils";
import { ChallengeInterface } from "@/lib/interfaces";
import {
  ChallengeStatusLabels,
  Domain,
  DomainLabels,
} from "@/constants/system";
import { statusStyles } from "@/constants/styles";
import { useRouter } from "next/navigation";
import { pageUrlMapping } from "@/constants/navigation";
import { epochToDateString } from "@/lib/time-utils";
import {
  getReviewPoolSize,
  getReviewQuorum,
} from "@/lib/fetching-onchain-data-utils";

interface ChallengeCardProps {
  challenge: ChallengeInterface;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();
  const formattedContributeDate = epochToDateString(challenge.contributeAt);
  const [poolSize, setPoolSize] = useState<number | null>(null);
  const [quorum, setQuorum] = useState<number | null>(null);

  // Fetch review pool size and quorum when the details dialog is opened, or when the challenge ID changes
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
  }, [showDetails, challenge.id]);

  return (
    <>
      <Card className="w-full overflow-hidden bg-blue-100 dark:bg-blue-950/60 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg dark:hover:shadow-blue-900/20 border-transparent hover:border-blue-300 dark:hover:border-blue-700 h-full group gap-3">
        <CardHeader className="">
          <CardTitle className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {challenge.title}
          </CardTitle>
          <div
            className="line-clamp-2 mt-1 text-muted-foreground text-sm"
            dangerouslySetInnerHTML={{ __html: challenge.description || "" }}
          ></div>
        </CardHeader>

        <CardContent className="flex flex-col text-sm text-muted-foreground gap-2">
          {/* changed contributor section */}
          <div className="flex items-center gap-1">
            <UserRoundPen className="h-3.5 w-3.5" />
            <span>Contributor:</span>
            <span
              className="ml-1 text-blue-600 hover:text-blue-600/80 dark:text-blue-400 dark:hover:text-blue-400/80 cursor-pointer"
              onClick={() =>
                toast(`Redirect to user profile: ${challenge.contributor}`)
              }
            >
              {challenge.contributor}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            <p>Category:</p>
            <Badge
              variant="outline"
              className="ml-1 font-normal border-black dark:border-blue-700"
            >
              {DomainLabels[challenge.category as Domain]}
            </Badge>
          </div>

          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Created on {formattedContributeDate}
          </div>

          <div className="flex items-center">
            <ShieldUser className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span>
              {poolSize !== null && quorum !== null
                ? `${poolSize} / ${quorum} joined`
                : "Loading..."}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between mt-2">
          <Button
            variant="default"
            className="cursor-pointer"
            onClick={() => {
              router.push(
                pageUrlMapping.moderation_reviewchallenges + `/${challenge.id}`
              );
              toast.info(`Redirect to review page: ${challenge.id}`);
            }}
          >
            Edit review
          </Button>

          <div
            className={cn(
              "flex items-center text-xs text-blue-600 dark:text-blue-400 transition-opacity cursor-pointer"
            )}
            onClick={() => setShowDetails(true)}
          >
            <span className="mr-1">Details</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </CardFooter>
      </Card>

      {/* Dialog pop ups when user click on challenge card */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between mt-3.5">
              <DialogTitle className="text-2xl">{challenge.title}</DialogTitle>
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
              <Badge variant="outline" className="w-fit">
                {DomainLabels[challenge.category as Domain]}
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
                <span>{formattedContributeDate}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Expected verification date
              </span>
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>Feb 31, 2077</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Participants
              </span>
              <div className="flex items-center">
                <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>0 enrolled</span>
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
          </div>

          {challenge.description && (
            <>
              <Separator />
              <div className="py-4">
                <h3 className="font-medium mb-2">Challenge Details</h3>
                <div
                  className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: challenge.description }}
                ></div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            {/* <Button>Edit</Button> */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
