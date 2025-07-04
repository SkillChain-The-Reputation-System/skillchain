"use client";

// Import hooks
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

// Import UI components
import {
  Form,
  FormField,
  FormControl,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
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
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import ChallengeDetailsSkeleton from "@/features/participation/challenge-details-skeleton";
import RichTextEditor from "@/components/rich-text-editor";

// Import lucide-react icons
import {
  ArrowBigUpDash,
  CalendarArrowUp,
  Clock,
  Star,
  Tag,
  UserRoundPen,
  Users,
  CalendarCheck,
  CalendarPlus2,
  Eye,
  Trophy,
  Save,
  Send,
  CalendarDays,
  LoaderCircle,
} from "lucide-react";

// Import utils
import { ChallengeInterface, SolutionInterface } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { solutionProgressStyles, difficultyStyles } from "@/constants/styles";
import { epochToDateString, epochToDateTimeString } from "@/lib/time-utils";
import {
  Domain,
  DomainLabels,
  ChallengeDifficultyLevel,
  ChallengeDifficultyLevelLabels,
  ChallengeSolutionProgress,
  ChallengeSolutionProgressLabels,
} from "@/constants/system";
import {
  saveSolutionDraft,
  submitSolution,
  putSolutionUnderReview,
} from "@/lib/write-onchain-utils";
import {
  getChallengeById,
  fetchSolutionByUserAndChallengeId,
  fetchNumberOfJoinedEvaluatorsById,
  fetchMaxEvaluatorsForSolutionById,
  fetchTimestampEvaluationCompleted,
} from "@/lib/fetching-onchain-data-utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageUrlMapping } from "@/constants/navigation";
import { getErrorMessage } from "@/lib/error-utils";

const solutionSchema = z.object({
  solution: z.string().max(10000, "Solution must be less than 4000 characters"),
});

export type SolutionFormValues = z.infer<typeof solutionSchema>;

interface WorkspaceChallengeDetailsProps {
  challenge_id: `0x${string}`;
}

export default function WorkspaceChallenge({
  challenge_id,
}: WorkspaceChallengeDetailsProps) {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [puttingUnderReview, setPuttingUnderReview] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [challenge, setChallenge] = useState<ChallengeInterface | null>(null);
  const [solution, setSolution] = useState<SolutionInterface | null>(null);
  // if solution is under review or reviewed
  const [joinedEvaluators, setJoinedEvaluators] = useState<number>(0);
  const [totalEvaluators, setTotalEvaluators] = useState<number>(0);
  const [completedDate, setCompletedDate] = useState<number | undefined>(0);

  const form = useForm<SolutionFormValues>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      solution: "",
    },
  });

  // handle submitting
  function onSubmit() {
    form.handleSubmit(async (data: SolutionFormValues) => {
      if (!address || !challenge || !solution) {
        return;
      }

      try {
        setSubmitting(true);
        const success = await submitSolution(
          challenge_id,
          address,
          data.solution
        );

        if (success) {
          const fetchedSolution = await fetchSolutionByUserAndChallengeId(
            address,
            challenge_id
          );
          setSolution(fetchedSolution);
          toast.success("You have submitted this solution");
        }
      } catch (error: any) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsDialogOpen(false);
        setSubmitting(false);
      }
    })();
  }

  // handle saving draft
  function onSaveDraft() {
    form.handleSubmit(async (data: SolutionFormValues) => {
      if (!address || !challenge || !solution) {
        return;
      }

      try {
        setSavingDraft(true);
        const success = await saveSolutionDraft(
          challenge_id,
          address,
          data.solution
        );
        if (success) {
          toast.info("Saved draft for this solution");
        }
      } catch (error: any) {
        toast.error(getErrorMessage(error));
      } finally {
        setSavingDraft(false);
      }
    })();
  }

  async function onPutUnderReview() {
    if (!address || !challenge || !solution) {
      return;
    }

    try {
      setPuttingUnderReview(true);
      const success = await putSolutionUnderReview(challenge_id, address);
      if (success) {
        const fetchedSolution = await fetchSolutionByUserAndChallengeId(
          address,
          challenge_id
        );
        setSolution(fetchedSolution);
        toast.success("You've put this solution under review");
      }
    } catch (error: any) {
      toast.error("Error occurs. Please try again!");
    } finally {
      setIsDialogOpen(false);
      setPuttingUnderReview(false);
    }
  }

  // fetch data once
  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;

      try {
        setIsLoading(true);
        const [fetchedChallenge, fetchedSolution] = await Promise.all([
          getChallengeById(challenge_id),
          fetchSolutionByUserAndChallengeId(address, challenge_id),
        ]);

        setChallenge(fetchedChallenge);
        setSolution(fetchedSolution);

        if (fetchedSolution && fetchedSolution.solution?.trim().length !== 0)
          form.reset({
            solution: fetchedSolution.solution,
          });

        if (
          fetchedSolution?.progress == ChallengeSolutionProgress.UNDER_REVIEW ||
          fetchedSolution?.progress == ChallengeSolutionProgress.REVIEWED
        ) {
          const [
            fetchedEvaluators,
            fetchedTotalEvaluators,
            fetchedCompletedDate,
          ] = await Promise.all([
            fetchNumberOfJoinedEvaluatorsById(fetchedSolution.solutionId),
            fetchMaxEvaluatorsForSolutionById(fetchedSolution.solutionId),
            fetchTimestampEvaluationCompleted(fetchedSolution.solutionId),
          ]);

          setJoinedEvaluators(fetchedEvaluators);
          setTotalEvaluators(fetchedTotalEvaluators);
          setCompletedDate(fetchedCompletedDate);
        }
      } catch (error: any) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isConnected]);

  return (
    <>
      {address &&
        (isLoading ? (
          <ChallengeDetailsSkeleton />
        ) : challenge && solution ? (
          <div>
            <Toaster position="top-right" richColors />

            <AlertDialog open={isDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-bold">
                    {solution.progress == ChallengeSolutionProgress.IN_PROGRESS
                      ? "Confirm submitting solution"
                      : solution.progress ==
                          ChallengeSolutionProgress.SUBMITTED &&
                        "Confirm publishing for Evaluation"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {solution.progress == ChallengeSolutionProgress.IN_PROGRESS
                      ? "This action cannot be undone, and you won't be able to edit this solution afterward."
                      : solution.progress ==
                          ChallengeSolutionProgress.SUBMITTED &&
                        "Your solution will be published to your Evaluators. Are you ready to submit it for evaluation?"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className="cursor-pointer"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={submitting || puttingUnderReview}
                  >
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction
                    className="cursor-pointer bg-zinc-700 hover:bg-zinc-700/80 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/80"
                    onClick={() => {
                      if (
                        solution.progress ==
                        ChallengeSolutionProgress.IN_PROGRESS
                      ) {
                        onSubmit();
                      } else if (
                        solution.progress == ChallengeSolutionProgress.SUBMITTED
                      ) {
                        onPutUnderReview();
                      }
                    }}
                    disabled={submitting || puttingUnderReview}
                  >
                    {submitting || puttingUnderReview ? (
                      <div className="flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "Confirm"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="space-y-8">
              {/* Header section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold break-all">
                    {challenge.title}
                  </h1>
                </div>

                <Badge
                  className={cn(
                    "text-md font-bold",
                    solutionProgressStyles[
                      solution.progress as keyof typeof solutionProgressStyles
                    ]
                  )}
                >
                  {
                    ChallengeSolutionProgressLabels[
                      solution.progress as ChallengeSolutionProgress
                    ]
                  }
                </Badge>
              </div>

              {/* Workspace section */}
              <Tabs defaultValue="information">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="information" className="cursor-pointer">
                    Information
                  </TabsTrigger>
                  <TabsTrigger value="description" className="cursor-pointer">
                    Description
                  </TabsTrigger>
                  <TabsTrigger value="solution" className="cursor-pointer">
                    Solution
                  </TabsTrigger>
                </TabsList>
                {/* Information section */}
                <TabsContent value="information" className="space-y-8">
                  <Separator className="bg-black" />

                  {/* About challenge section */}
                  <h1 className="text-xl font-bold">About challenge</h1>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">
                        Contributor
                      </span>
                      <div className="flex items-center gap-1.5">
                        <UserRoundPen className="h-full max-h-4 w-full max-w-4" />
                        <span className="ml-1 text-indigo-800 dark:text-indigo-300 break-all">
                          {challenge.contributor}
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
                        <span>
                          {epochToDateString(challenge.contributeAt || 0)}
                        </span>
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

                  {/* About your work section */}
                  <h1 className="text-xl font-bold">About your work</h1>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">
                        Joined on
                      </span>
                      <div className="flex items-center gap-1.5">
                        <CalendarPlus2 className="h-full max-h-4 w-full max-w-4" />
                        <span>{epochToDateTimeString(solution.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">
                        Score
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-full max-h-4 w-full max-w-4 text-amber-500 dark:text-amber-400 fill-current" />
                        <span>
                          {solution.progress !==
                          ChallengeSolutionProgress.REVIEWED
                            ? "--"
                            : solution.score}
                        </span>
                      </div>
                    </div>

                    {/* Display submission date if solution is submitted */}
                    {solution.progress !==
                      ChallengeSolutionProgress.IN_PROGRESS && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-muted-foreground">
                          Submission Date
                        </span>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-full max-h-4 w-full max-w-4" />
                          <span>
                            {epochToDateTimeString(
                              Number(solution.submittedAt) * 1000
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    {solution.progress ===
                      ChallengeSolutionProgress.UNDER_REVIEW && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-muted-foreground">
                          Evaluators
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-full max-h-4 w-full max-w-4" />
                          <span>
                            {joinedEvaluators} / {totalEvaluators} joined
                          </span>
                        </div>
                      </div>
                    )}

                    {solution.progress ===
                      ChallengeSolutionProgress.REVIEWED && (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-medium text-muted-foreground">
                            Total Evaluators
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Eye className="h-full max-h-4 w-full max-w-4" />
                            <span>{totalEvaluators} reviewed</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-medium text-muted-foreground">
                            Evaluation Completed Date
                          </span>
                          <div className="flex items-center gap-1.5">
                            <CalendarCheck className="h-full max-h-4 w-full max-w-4" />
                            <span>{epochToDateTimeString(completedDate!)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
                {/* Description of challenge section */}
                <TabsContent value="description" className="space-y-8">
                  <Separator className="bg-black" />

                  <div className="space-y-4">
                    <RichTextEditor
                      value={challenge.description!}
                      editable={false}
                    />
                  </div>
                </TabsContent>
                {/* Solution section */}
                <TabsContent value="solution">
                  <Separator className="bg-black" />
                  {/* Rich Text Editor for user working on solution */}
                  <Form {...form}>
                    <form className="w-full mt-8 space-y-8">
                      <FormField
                        control={form.control}
                        name="solution"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RichTextEditor
                                {...field}
                                className="max-w-[1401px] min-h-[320px]"
                                placeholder="What is your solution about this challenge..."
                                editable={
                                  solution.progress ==
                                  ChallengeSolutionProgress.IN_PROGRESS
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>

                  {/* Display buttons according to status of solution */}
                  <div className="flex justify-end items-center gap-5 mt-5">
                    {solution.progress ==
                    ChallengeSolutionProgress.IN_PROGRESS ? (
                      <>
                        <Button
                          variant="outline"
                          size="lg"
                          className="flex items-center cursor-pointer gap-2 border-gray-300 hover:bg-accent"
                          onClick={onSaveDraft}
                          disabled={savingDraft || submitting}
                        >
                          <Save className="h-4 w-4" />
                          Save draft
                        </Button>

                        <Button
                          size="lg"
                          className="flex items-center gap-2 cursor-pointer shrink-0 bg-zinc-700 hover:bg-zinc-700/80 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/80"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          <Send className="h-4 w-4" />
                          Submit
                        </Button>
                      </>
                    ) : (
                      solution.progress ==
                        ChallengeSolutionProgress.SUBMITTED && (
                        <>
                          <Button
                            size="lg"
                            className="flex items-center gap-2 cursor-pointer border bg-purple-800 hover:bg-purple-800/60 text-white dark:bg-purple-400 dark:hover:bg-purple-400/60 dark:text-black"
                            onClick={() => setIsDialogOpen(true)}
                          >
                            <ArrowBigUpDash className="h-4 w-4" />
                            Put Under Review
                          </Button>
                        </>
                      )
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="text-center object-center py-12">
            <h2 className="text-xl font-semibold mb-2">Work not found</h2>
            <p className="text-muted-foreground mb-6">
              The work you're looking for doesn't exist or you haven't joined
              this challenge.
            </p>
            <Button
              onClick={() =>
                router.push(pageUrlMapping.participation_workspace)
              }
            >
              Return to Workspace
            </Button>
          </div>
        ))}
    </>
  );
}
