"use client";

// Import hooks
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

// Import UI components
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormControl,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
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
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import SolutionDetailsSkeleton from "@/features/evaluation/solution-details-skeleton";
import RichTextEditor from "@/components/rich-text-editor";

// Import lucide-react icons
import {
  CalendarArrowUp,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Tag,
  Star,
  UserRoundPen,
  Users,
  FileCheck,
  Trophy,
  LoaderCircle,
  CalendarCheck,
} from "lucide-react";

// Import utils
import {
  fetchSolutionReviewPool,
  fetchEvaluationForSolutionByEvaluator,
  getChallengeById,
} from "@/lib/fetching-onchain-data-utils";
import { submitEvaluationScore } from "@/lib/write-onchain-utils";
import {
  SolutionReviewPool,
  ChallengeInterface,
  EvaluationInterface,
} from "@/lib/interfaces";
import {
  Domain,
  DomainLabels,
  ChallengeDifficultyLevel,
  ChallengeDifficultyLevelLabels,
  ChallengeSolutionProgress,
} from "@/constants/system";
import { epochToDateString, epochToDateTimeString } from "@/lib/time-utils";
import { difficultyStyles } from "@/constants/styles";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageUrlMapping } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-utils";
import { getUserNameByAddress } from "@/lib/get/get-user-data-utils";

const evaluationSchema = z.object({
  score: z.coerce
    .number()
    .min(0, "Score must be in range 0 - 100")
    .max(100, "Score must be in range 0 - 100"),
});

export type EvaluationFormValues = z.infer<typeof evaluationSchema>;

interface EvaluationDetailProps {
  solutionId: `0x${string}`;
}

export default function EvaluationDetail({
  solutionId,
}: EvaluationDetailProps) {
  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      score: 0,
    },
    mode: "onChange",
  });

  const { address } = useAccount();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [solutionReviewPool, setSolutionReviewPool] =
    useState<SolutionReviewPool | null>(null);
  const [challenge, setChallenge] = useState<ChallengeInterface | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationInterface | null>(
    null
  );
  const [contributorName, setContributorName] = useState<string | undefined>();
  const [submitterName, setSubmitterName] = useState<string | undefined>();

  const submitEvaluation = () => {
    form.handleSubmit(async (data: EvaluationFormValues) => {
      if (!address || !solutionReviewPool) {
        return;
      }

      try {
        setSubmitting(true);
        const success = await submitEvaluationScore(
          solutionId,
          address as `0x${string}`,
          data.score
        );
        if (success) {
          const fetchedSolution = await fetchSolutionReviewPool(solutionId);
          setSolutionReviewPool(fetchedSolution);

          if (fetchedSolution) {
            const [fetchedChallenge, fetchedEvaluation] = await Promise.all([
              getChallengeById(fetchedSolution.solution.challengeId),
              address
                ? fetchEvaluationForSolutionByEvaluator(
                    address as `0x${string}`,
                    solutionId
                  )
                : Promise.resolve(null),
            ]);
            setChallenge(fetchedChallenge);
            setEvaluation(fetchedEvaluation);
          }
          toast.success("Submitted score for this solution");
        }
      } catch (error: any) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsDialogOpen(false);
        setSubmitting(false);
      }
    })();
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedSolution = await fetchSolutionReviewPool(solutionId);
        setSolutionReviewPool(fetchedSolution);

        if (fetchedSolution) {
          const [fetchedChallenge, fetchedEvaluation] = await Promise.all([
            getChallengeById(fetchedSolution.solution.challengeId),
            address
              ? fetchEvaluationForSolutionByEvaluator(
                  address as `0x${string}`,
                  solutionId
                )
              : Promise.resolve(null),
          ]);
          setChallenge(fetchedChallenge);
          setEvaluation(fetchedEvaluation);
          if (fetchedChallenge) {
            const contributor = fetchedChallenge.contributor as `0x${string}`;
            const cName = await getUserNameByAddress(contributor);
            setContributorName(
              cName && cName !== contributor ? cName : undefined
            );
          }
          const submitter = fetchedSolution.solution.user as `0x${string}`;
          const sName = await getUserNameByAddress(submitter);
          setSubmitterName(sName && sName !== submitter ? sName : undefined);
        }
      } catch (error: any) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [address]);

  return address ? (
    isLoading ? (
      <SolutionDetailsSkeleton />
    ) : solutionReviewPool && challenge ? (
      <div>
        <Toaster position="top-right" richColors />

        <AlertDialog open={isDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">
              Confirm submitting score
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone, and the submitted score will
              impact your reputation. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => setIsDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={submitEvaluation}
              disabled={submitting}
            >
              {submitting ? (
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
        {/* Header Section - styled card */}
        <div className="rounded-xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/30 dark:to-zinc-900/30 shadow-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-200 dark:border-slate-700">
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 break-all">{challenge.title}</h1>
          </div>
          {solutionReviewPool.solution.progress ==
          ChallengeSolutionProgress.REVIEWED ? (
            <Button
              size="lg"
              disabled
              variant={"joined"}
            >
              <CheckCircle2 className="h-4 w-4" />
              Evaluation Completed
            </Button>
          ) : (
            <Button
              size="lg"
              className="shrink-0 gap-2 rounded-lg bg-amber-600 hover:bg-amber-700"
              disabled
            >
              <LoaderCircle className="h-4 w-4 animate-spin duration-3000" />
              Evaluating...
            </Button>
          )}
        </div>

        {/* Workspace section - styled tabs */}
        <Tabs defaultValue="information">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/40 p-1 mb-6">
            <TabsTrigger value="information" className="cursor-pointer rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 transition-all">
              Challenge Information
            </TabsTrigger>
            <TabsTrigger value="solution" className="cursor-pointer rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 transition-all">
              Solution Information
            </TabsTrigger>
          </TabsList>
          {/* Challenge info section */}
          <TabsContent value="information" className="space-y-8">
            {/* About challenge section */}
            <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700">
              <h1 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">About challenge</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Contributor</span>
                  <div className="flex items-center gap-1.5">
                    <UserRoundPen className="h-full max-h-4 w-full max-w-4" />
                    <span className="ml-1 text-slate-700 dark:text-slate-300 break-all">{contributorName ?? challenge.contributor}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Domain</span>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-full max-h-4 w-full max-w-4" />
                    <span className="ml-1">{DomainLabels[challenge.category as Domain]}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Quality Score</span>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-full max-h-4 w-full max-w-4 text-amber-500 fill-current" />
                    <span>{challenge.qualityScore} / 100</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Participants</span>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-full max-h-4 w-full max-w-4" />
                    <span>{challenge.participants} people</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Contributed date</span>
                  <div className="flex items-center gap-1.5">
                    <CalendarArrowUp className="h-full max-h-4 w-full max-w-4" />
                    <span>{epochToDateString(challenge.contributeAt || 0)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Difficulty Level</span>
                  <div className="flex items-center gap-1.5">
                    <Badge className={cn("capitalize px-2 py-1 rounded-lg", difficultyStyles[challenge.difficultyLevel as keyof typeof difficultyStyles])}>
                      {ChallengeDifficultyLevelLabels[challenge.difficultyLevel as ChallengeDifficultyLevel]}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Estimated solve time</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-full max-h-4 w-full max-w-4" />
                    <span>{challenge.solveTime} minutes</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Description Section */}
            <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Description</h2>
              <RichTextEditor value={challenge.description} editable={false} />
            </div>
          </TabsContent>

          {/* Solution section */}
          <TabsContent value="solution" className="space-y-8">
            {/* General info section */}
            <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">General Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Submitter</span>
                  <div className="flex items-center gap-1.5">
                    <UserRoundPen className="h-full max-h-4 w-full max-w-4" />
                    <span className="ml-1 text-slate-700 dark:text-slate-300 break-all">{submitterName ?? solutionReviewPool.solution.user}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Submission Date</span>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-full max-h-4 w-full max-w-4" />
                    <span>{epochToDateTimeString(solutionReviewPool.solution.submittedAt || 0)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Evaluators</span>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-full max-h-4 w-full max-w-4" />
                    <span>{solutionReviewPool.numberOfEvaluators} / {solutionReviewPool.totalEvaluators} joined</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Completed Evaluations</span>
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="h-full max-h-4 w-full max-w-4" />
                    <span>{solutionReviewPool.numberOfSubmittedEvaluation} / {solutionReviewPool.totalEvaluators} done</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Final Score</span>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-full max-h-4 w-full max-w-4 text-amber-500 dark:text-amber-400 fill-current" />
                    {solutionReviewPool.solution.progress ==
                    ChallengeSolutionProgress.REVIEWED ? (
                      <span>{solutionReviewPool.solution.score}</span>
                    ) : (
                      <span>--</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Evaluation Completed Date</span>
                  <div className="flex items-center gap-1.5">
                    <CalendarCheck className="h-full max-h-4 w-full max-w-4" />
                    {solutionReviewPool.solution.progress ==
                    ChallengeSolutionProgress.REVIEWED ? (
                      <span>{epochToDateTimeString(solutionReviewPool.completedAt || 0)}</span>
                    ) : (
                      <span>--</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Solution content section */}
            <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Solution</h2>
              <RichTextEditor
                value={solutionReviewPool.solution.solution}
                className="min-h-80"
                editable={false}
              />
            </div>

            {/* Evaluation section */}
            <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700">
              {evaluation?.isSubmitted ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Your Evaluation Score</h3>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500 fill-current" />
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">{evaluation.score}</span>
                      <span className="text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Submitted on</p>
                    <p className="text-sm font-medium">{epochToDateTimeString(evaluation.submittedAt!)}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Submit Your Evaluation</h3>
                  <p className="text-muted-foreground">How would you rate this solution? (0 - 100)</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <Form {...form}>
                      <form className="flex-1 max-w-xs">
                        <FormField
                          control={form.control}
                          name="score"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  placeholder="Enter score (0-100)"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>

                    <Button
                      onClick={() =>
                        form.trigger().then((isValid) => {
                          if (isValid) {
                            setIsDialogOpen(true);
                          }
                        })
                      }
                    >
                      Submit Evaluation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    ) : (
      <div className="text-center object-center py-12">
        <h2 className="text-xl font-semibold mb-2">Solution not found</h2>
        <p className="text-muted-foreground mb-6">
          The solution you've joined for evaluation doesn't exist or has
          been removed.
        </p>
        <Button
          onClick={() =>
            router.push(pageUrlMapping.evaluation_evaluatedbyme)
          }
          className="rounded-lg"
        >
          Return to Evaluation Workspace
        </Button>
      </div>
    )
  ) : null;
}
