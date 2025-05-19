'use client'

// Import hooks
import { useForm } from "react-hook-form";
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'

// Import UI components
import {
  Form,
  FormField,
  FormControl,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'
import { Toaster, toast } from "sonner"
import ChallengeDetailsSkeleton from '@/features/participation/challenge-details-skeleton'
import RichTextEditor from '@/components/rich-text-editor'

// Import lucide-react icons
import {
  ArrowBigUpDash,
  ArrowLeft,
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
  Send
} from "lucide-react";

// Import utils
import { ChallengeInterface, SolutionInterface } from '@/lib/interfaces';
import { cn } from '@/lib/utils'
import { solutionProgressStyles, difficultyStyles } from '@/constants/styles'
import { epochToDateString, epochToDateTimeString } from "@/lib/time-utils";
import {
  Domain,
  DomainLabels,
  ChallengeDifficultyLevel,
  ChallengeDifficultyLevelLabels,
  ChallengeSolutionProgress,
  ChallengeSolutionProgressLabels
} from '@/constants/system'
import {
  saveSolutionDraft,
  submitSolution,
  putSolutionUnderReview,
  waitForTransaction
} from '@/lib/write-onchain-utils'
import {
  getChallengeById,
  fetchSolutionByUserAndChallengeId,
  fetchNumberOfJoinedEvaluatorsById,
  fetchMaxEvaluatorsForSolutionById,
} from "@/lib/fetching-onchain-data-utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageUrlMapping } from "@/constants/navigation"

const solutionSchema = z.object({
  solution: z
    .string()
    .max(10000, "Solution must be less than 4000 characters"),
});

export type SolutionFormValues = z.infer<typeof solutionSchema>;

interface WorkspaceChallengeDetailsProps {
  challenge_id: number;
}

export default function WorkspaceChallenge({ challenge_id }: WorkspaceChallengeDetailsProps) {
  const { address } = useAccount();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [challenge, setChallenge] = useState<ChallengeInterface | null>(null);
  const [solution, setSolution] = useState<SolutionInterface | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [puttingUnderReview, setPuttingUnderReview] = useState(false);

  // if solution is under review or reviewed
  const [joinedEvaluators, setJoinedEvaluators] = useState(0);
  const [totalEvaluators, setTotalEvaluators] = useState(0);

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
        const txHash = await submitSolution(Number(challenge_id), address, data.solution);
        await waitForTransaction(txHash);
        toast.success("You have submitted this solution");
      } catch (error: any) {
        toast.error("Error occurs. Please try again!");
      } finally {
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
        await saveSolutionDraft(Number(challenge_id), address, data.solution);
        toast.info("Saved draft for this solution");
      } catch (error: any) {
        toast.error("Error occurs. Please try again!");
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
      await putSolutionUnderReview(Number(challenge_id), address);
      toast.success("You've put this solution under review");
    } catch (error: any) {
      toast.error("Error occurs. Please try again!");
    } finally {
      setPuttingUnderReview(false);
    }
  }

  // fetch data once
  useEffect(() => {
    const fetchData = async () => {
      if (!address)
        return;

      try {
        setIsLoading(true);
        const [
          fetchedChallenge,
          fetchedSolution
        ] = await Promise.all([
          getChallengeById(challenge_id),
          fetchSolutionByUserAndChallengeId(address, challenge_id)
        ]);

        setChallenge(fetchedChallenge);
        setSolution(fetchedSolution);

        if (fetchedSolution && fetchedSolution.solution?.trim().length !== 0)
          form.reset({ solution: fetchedSolution.solution })

        if ((fetchedSolution?.progress == ChallengeSolutionProgress.UNDER_REVIEW) || (fetchedSolution?.progress == ChallengeSolutionProgress.REVIEWED)) {
          const [
            fetchedEvaluators,
            fetchedTotalEvaluators
          ] = await Promise.all([
            fetchNumberOfJoinedEvaluatorsById(Number(fetchedSolution.solutionId)),
            fetchMaxEvaluatorsForSolutionById(Number(fetchedSolution.solutionId))
          ]);

          setJoinedEvaluators(fetchedEvaluators);
          setTotalEvaluators(fetchedTotalEvaluators)
        }

      } catch (error) {
        toast.error("Error occurs. Please try again");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [address]);

  // fetch new solution data after submitting solution
  useEffect(() => {
    const fetchedData = async () => {
      if (!address)
        return;

      try {
        const fetchedSolution = await fetchSolutionByUserAndChallengeId(address, challenge_id);
        setSolution(fetchedSolution);
      } catch (error) {
        toast.error("Error occurs. Please try again");
      }
    }

    fetchedData();
  }, [submitting, puttingUnderReview])

  return (
    <>
      {address && (
        isLoading ? (
          <div>
            <ChallengeDetailsSkeleton />
          </div>
        ) : (challenge && solution) ? (
          <div>
            <Toaster position="top-right" richColors />

            <Button
              variant="outline"
              size="sm"
              className="mb-6 gap-1 text-muted-foreground hover:text-foreground bg-gray-200 cursor-pointer"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Workspace
            </Button>

            <div className="space-y-8">
              {/* Header section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold break-all">{challenge.title}</h1>
                </div>

                <Badge className={cn("text-md font-bold", solutionProgressStyles[solution.progress as keyof typeof solutionProgressStyles])}>
                  {ChallengeSolutionProgressLabels[solution.progress as ChallengeSolutionProgress]}
                </Badge>
              </div>

              {/* Workspace section */}
              <Tabs defaultValue="information">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="information" className="cursor-pointer">Information</TabsTrigger>
                  <TabsTrigger value="description" className="cursor-pointer">Description</TabsTrigger>
                  <TabsTrigger value="solution" className="cursor-pointer">Solution</TabsTrigger>
                </TabsList>
                {/* Information section */}
                <TabsContent value="information" className="space-y-8">
                  <Separator className='bg-black' />

                  {/* About challenge section */}
                  <h1 className="text-xl font-bold">About challenge</h1>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Contributor</span>
                      <div className="flex items-center gap-1.5">
                        <UserRoundPen className="h-full max-h-4 w-full max-w-4" />
                        <span className="ml-1 text-indigo-800 dark:text-indigo-300 break-all">
                          {challenge.contributor}
                        </span>
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
                        <span>{challenge.completed} done</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Contributed date</span>
                      <div className="flex items-center gap-1.5">
                        <CalendarArrowUp className="h-full max-h-4 w-full max-w-4" />
                        <span>{epochToDateString(challenge.contributeAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Difficulty Level</span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          className={cn("capitalize", difficultyStyles[challenge.difficultyLevel as keyof typeof difficultyStyles])}
                        >
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

                  <Separator className='bg-black' />

                  {/* About your work section */}
                  <h1 className="text-xl font-bold">About your work</h1>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Joined on</span>
                      <div className="flex items-center gap-1.5">
                        <CalendarPlus2 className="h-full max-h-4 w-full max-w-4" />
                        <span>{epochToDateTimeString(solution.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Score</span>
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-full max-h-4 w-full max-w-4 text-amber-500 dark:text-amber-400 fill-current" />
                        <span>{solution.progress != ChallengeSolutionProgress.REVIEWED ? "--" : solution.score}</span>
                      </div>
                    </div>

                    {/* Display submission date if solution is submitted */}
                    {solution.progress != ChallengeSolutionProgress.IN_PROGRESS && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-muted-foreground">Submitted on</span>
                        <div className="flex items-center gap-1.5">
                          <CalendarCheck className="h-full max-h-4 w-full max-w-4" />
                          <span>{epochToDateTimeString(solution.submittedAt)}</span>
                        </div>
                      </div>
                    )}

                    {solution.progress == ChallengeSolutionProgress.UNDER_REVIEW && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-muted-foreground">Evaluators</span>
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-full max-h-4 w-full max-w-4" />
                          <span>{joinedEvaluators} / {totalEvaluators} joined</span>
                        </div>
                      </div>
                    )}

                    {solution.progress == ChallengeSolutionProgress.REVIEWED && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-muted-foreground">Total Evaluators</span>
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-full max-h-4 w-full max-w-4" />
                          <span>{totalEvaluators} reviewed</span>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                {/* Description of challenge section */}
                <TabsContent value="description" className="space-y-8">
                  <Separator className='bg-black' />

                  <div className="space-y-4">
                    <RichTextEditor value={challenge.description!} editable={false} />
                  </div>
                </TabsContent>
                {/* Solution section */}
                <TabsContent value="solution">
                  <Separator className='bg-black' />
                  {/* Rich Text Editor for user working on solution */}
                  <Form {...form}>
                    <form
                      className="w-full mt-8 space-y-8"
                    >
                      <FormField
                        control={form.control}
                        name="solution"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RichTextEditor
                                {...field}
                                className="min-h-80 border-black dark:border-white border-1 rounded-md bg-slate-50 py-2 px-3 dark:bg-blue-950/15 break-all"
                                placeholder="What is your solution about this challenge..."
                                editable={solution.progress == ChallengeSolutionProgress.IN_PROGRESS}
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
                    {
                      solution.progress == ChallengeSolutionProgress.IN_PROGRESS ?
                        (
                          <>
                            <Button
                              variant="outline"
                              size="lg"
                              className="flex items-center gap-2 cursor-pointer border border-zinc-700"
                              onClick={onSaveDraft}
                              disabled={savingDraft || submitting}
                            >
                              <Save className="h-4 w-4" />
                              Save draft
                            </Button>

                            <Button
                              variant="outline"
                              size="lg"
                              className="flex items-center gap-2 cursor-pointer shrink-0 bg-zinc-700 hover:bg-zinc-700/60 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/60"
                              onClick={onSubmit}
                              disabled={savingDraft || submitting}
                            >
                              <Send className="h-4 w-4" />
                              Submit
                            </Button>
                          </>
                        ) : solution.progress == ChallengeSolutionProgress.SUBMITTED ? (
                          <>
                            <Button
                              variant="outline"
                              size="lg"
                              className="flex items-center gap-2 cursor-pointer border bg-purple-800 hover:bg-purple-800/60 text-white dark:bg-purple-400 dark:hover:bg-purple-400/60 dark:text-black"
                              onClick={onPutUnderReview}
                              disabled={puttingUnderReview}
                            >
                              <ArrowBigUpDash className="h-4 w-4" />
                              Put Under Review
                            </Button>
                          </>
                        ) : (
                          <>
                          </>
                        )
                    }

                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="text-center object-center py-12">
            <h2 className="text-xl font-semibold mb-2">Work not found</h2>
            <p className="text-muted-foreground mb-6">
              The work you're looking for doesn't exist or you haven't joined this challenge.
            </p>
            <Button onClick={() => router.push(pageUrlMapping.participation_workspace)}>Return to Workspace</Button>
          </div>
        )
      )}
    </>
  )
}
