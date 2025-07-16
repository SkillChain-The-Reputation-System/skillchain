"use client";

// Import hooks
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

// Import UI components
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import SolutionDetailsSkeleton from "@/features/evaluation/solution-details-skeleton";
import RichTextEditor from "@/components/rich-text-editor";

// Import lucide-react icons
import {
  ArrowLeft,
  CalendarArrowUp,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Tag,
  Star,
  UserRoundPen,
  Users,
  XCircle,
  LoaderCircle,
} from "lucide-react";

// Import utils
import {
  fetchSolutionReviewPool,
  fetchEvaluatorHasJoinedSolutionState,
  getChallengeById,
} from "@/lib/fetching-onchain-data-utils";
import { joinEvaluationPool } from "@/lib/write-onchain-utils";
import { SolutionReviewPool, ChallengeInterface } from "@/lib/interfaces";
import {
  Domain,
  DomainLabels,
  ChallengeDifficultyLevel,
  ChallengeDifficultyLevelLabels,
} from "@/constants/system";
import { epochToDateString, epochToDateTimeString } from "@/lib/time-utils";
import { difficultyStyles } from "@/constants/styles";
import { pageUrlMapping } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-utils";
import { getUserNameByAddress } from "@/lib/get/get-user-data-utils";

interface SolutionDetailProps {
  solutionId: `0x${string}`;
}

export default function SolutionDetail({ solutionId }: SolutionDetailProps) {
  const { address } = useAccount();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [solutionReviewPool, setSolutionReviewPool] =
    useState<SolutionReviewPool | null>(null);
  const [challenge, setChallenge] = useState<ChallengeInterface | null>(null);
  const [evaluatorHasJoined, setEvaluatorHasJoined] = useState(false);
  const [contributorName, setContributorName] = useState<string | undefined>();
  const [submitterName, setSubmitterName] = useState<string | undefined>();

  const handleJoinEvaluation = async () => {
    if (!address || !solutionReviewPool) {
      return;
    }

    if (address == solutionReviewPool.solution.user) {
      toast.error("You cannot evaluate your own solution");
      return;
    }

    try {
      setJoining(true);
      const success = await joinEvaluationPool(
        solutionId,
        address as `0x${string}`
      );

      if (success) {
        const fetchedSolution = await fetchSolutionReviewPool(solutionId);
        setSolutionReviewPool(fetchedSolution);

        if (fetchedSolution) {
          const fetchedJoinedState = address
            ? await fetchEvaluatorHasJoinedSolutionState(
                address as `0x${string}`,
                solutionId
              )
            : false;
          setEvaluatorHasJoined(fetchedJoinedState);
        }
        toast.success("You have joined the evaluation pool");
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDialogOpen(false);
      setJoining(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedSolution = await fetchSolutionReviewPool(solutionId);
        setSolutionReviewPool(fetchedSolution);

        if (fetchedSolution) {
          const [fetchedChallenge, fetchedJoinedState] = await Promise.all([
            getChallengeById(fetchedSolution.solution.challengeId),
            address
              ? fetchEvaluatorHasJoinedSolutionState(
                  address as `0x${string}`,
                  solutionId
                )
              : Promise.resolve(false),
          ]);
          setChallenge(fetchedChallenge);
          setEvaluatorHasJoined(fetchedJoinedState);
          const contributor = fetchedChallenge.contributor as `0x${string}`;
          const cName = await getUserNameByAddress(contributor);
          setContributorName(cName && cName !== contributor ? cName : undefined);
          const submitter = fetchedSolution.solution.user as `0x${string}`;
          const sName = await getUserNameByAddress(submitter);
          setSubmitterName(sName && sName !== submitter ? sName : undefined);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [address]);

  return isLoading ? (
    <SolutionDetailsSkeleton />
  ) : solutionReviewPool && challenge ? (
    <div>
      <Toaster position="top-right" richColors />

      <AlertDialog open={isDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">
              Confirm evaluating solution
            </AlertDialogTitle>
            <AlertDialogDescription>
              Once you join, you'll be able to access and evaluate the full
              solution. This action is recorded and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => setIsDialogOpen(false)}
              disabled={joining}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              className="cursor-pointer bg-zinc-700 hover:bg-zinc-700/80 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/80"
              onClick={handleJoinEvaluation}
              disabled={joining}
            >
              {joining ? (
                <div className="flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                "Proceed"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold break-all">{challenge.title}</h1>
          </div>

          {evaluatorHasJoined ? (
            <Button
              size="lg"
              className="shrink-0 bg-green-600 hover:bg-green-700 text-white gap-2"
              disabled
            >
              <CheckCircle2 className="h-4 w-4" />
              Joined Evaluation
            </Button>
          ) : solutionReviewPool.numberOfEvaluators ==
            solutionReviewPool.totalEvaluators ? (
            <Button
              size="lg"
              className="shrink-0 bg-red-800 text-white gap-2"
              disabled
            >
              <XCircle className="h-4 w-4" />
              Max evaluators
            </Button>
          ) : (
            <Button
              size="lg"
              className="shrink-0 bg-zinc-700 hover:bg-zinc-700/80 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/80 cursor-pointer"
              onClick={() => setIsDialogOpen(true)}
            >
              Evaluate Solution
            </Button>
          )}
        </div>

        {/* Workspace section */}
        <Tabs defaultValue="information">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="information" className="cursor-pointer">
              Challenge Information
            </TabsTrigger>
            <TabsTrigger value="solution" className="cursor-pointer">
              Solution Information
            </TabsTrigger>
          </TabsList>
          {/* Challenge info section */}
          <TabsContent value="information" className="space-y-8">
            <Separator className="bg-black" />

            {/* General info section */}
            <h2 className="text-xl font-bold">General Info</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
              <div className="col-span-2 flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Contributor
                </span>
                <div className="flex items-center gap-1.5">
                  <UserRoundPen className="h-full max-h-4 w-full max-w-4" />
                  <span className="ml-1 text-indigo-800 dark:text-indigo-300 break-all">
                    {contributorName ?? challenge.contributor}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Domain
                </span>
                <div className="flex items-center gap-1.5">
                  <Tag className="h-full max-h-4 w-full max-w-4" />
                  <span className="ml-1">
                    {DomainLabels[challenge.category as Domain]}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Quality Score
                </span>
                <div className="flex items-center gap-1.5">
                  <Star className="h-full max-h-4 w-full max-w-4 text-amber-500 fill-current" />
                  <span>{challenge.qualityScore} / 100</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Participants
                </span>
                <div className="flex items-center gap-1.5">
                  <Users className="h-full max-h-4 w-full max-w-4" />
                  <span>{challenge.participants} people</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Contributed date
                </span>
                <div className="flex items-center gap-1.5">
                  <CalendarArrowUp className="h-full max-h-4 w-full max-w-4" />
                  <span>{epochToDateString(challenge.contributeAt || 0)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Difficulty Level
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge
                    className={cn(
                      "capitalize",
                      difficultyStyles[
                        challenge.difficultyLevel as keyof typeof difficultyStyles
                      ]
                    )}
                  >
                    {
                      ChallengeDifficultyLevelLabels[
                        challenge.difficultyLevel as ChallengeDifficultyLevel
                      ]
                    }
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Estimated solve time
                </span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-full max-h-4 w-full max-w-4" />
                  <span>{challenge.solveTime} minutes</span>
                </div>
              </div>
            </div>

            <Separator className="bg-black" />

            {/* Description Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Description</h2>
              <RichTextEditor value={challenge.description} editable={false} />
            </div>
          </TabsContent>

          {/* Solution section */}
          <TabsContent value="solution" className="space-y-8">
            <Separator className="bg-black" />

            {/* General info section */}
            <h2 className="text-xl font-bold">General Info</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
              <div className="col-span-2 flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Submitter
                </span>
                <div className="flex items-center gap-1.5">
                  <UserRoundPen className="h-full max-h-4 w-full max-w-4" />
                  <span className="ml-1 text-indigo-800 dark:text-indigo-300 break-all">
                    {submitterName ?? solutionReviewPool.solution.user}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Submission Date
                </span>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-full max-h-4 w-full max-w-4" />
                  <span>
                    {epochToDateTimeString(
                      solutionReviewPool.solution.submittedAt || 0
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Evaluators
                </span>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-full max-h-4 w-full max-w-4" />
                  <span>
                    {solutionReviewPool.numberOfEvaluators} /{" "}
                    {solutionReviewPool.totalEvaluators} joined
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ) : (
    <div className="text-center object-center py-12">
      <h2 className="text-xl font-semibold mb-2">Solution not found</h2>
      <p className="text-muted-foreground mb-6">
        The solution you're looking for doesn't exist or has been removed.
      </p>
      <Button
        onClick={() => router.push(pageUrlMapping.evaluation_pendingsolutions)}
      >
        Return to Explore Solutions
      </Button>
    </div>
  );
}
