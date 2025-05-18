'use client';

// Import hooks
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

// Import UI components
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs'
import { Badge } from "@/components/ui/badge";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from "sonner"
import SolutionDetailsSkeleton from "@/features/evaluation/solution-details-skeleton";
import RichTextEditor from '@/components/rich-text-editor'

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
} from "lucide-react";

// Import utils
import { fetchSolutionReviewPool, fetchEvaluatorHasJoinedSolutionState, getChallengeById } from "@/lib/fetching-onchain-data-utils";
import { joinEvaluationPool, waitForTransaction } from "@/lib/write-onchain-utils";
import { SolutionReviewPool, ChallengeInterface } from "@/lib/interfaces";
import {
  Domain,
  DomainLabels,
  ChallengeDifficultyLevel,
  ChallengeDifficultyLevelLabels,
} from "@/constants/system";
import { epochToDateString, epochToDateTimeString } from "@/lib/time-utils";
import { difficultyStyles } from "@/constants/styles";
import { cn } from "@/lib/utils";

interface SolutionDetailProps {
  solutionId: number;
}

export default function SolutionDetail({ solutionId }: SolutionDetailProps) {
  const { address } = useAccount();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [solutionReviewPool, setSolutionReviewPool] = useState<SolutionReviewPool | null>(null);
  const [challenge, setChallenge] = useState<ChallengeInterface | null>(null);

  // for explore solutions
  const [joining, setJoining] = useState(false);
  const [evaluatorHasJoined, setEvaluatorHasJoined] = useState(false);

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
      const txHash = await joinEvaluationPool(solutionId, address as `0x${string}`);
      await waitForTransaction(txHash);
      toast.success("You have joined the evaluation pool");
    } catch (error) {
      toast.error("Failed to join the evaluation pool");
    } finally {
      setJoining(false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedSolution = await fetchSolutionReviewPool(solutionId);
        setSolutionReviewPool(fetchedSolution);

        if (fetchedSolution) {
          const [fetchedChallenge, fetchedJoinedState] = await Promise.all([
            getChallengeById(Number(fetchedSolution.solution.challengeId)),
            address ? fetchEvaluatorHasJoinedSolutionState(address as `0x${string}`, solutionId) : Promise.resolve(false),
          ]);
          setChallenge(fetchedChallenge);
          setEvaluatorHasJoined(fetchedJoinedState);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [address])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedSolution = await fetchSolutionReviewPool(solutionId);
        setSolutionReviewPool(fetchedSolution);

        if (fetchedSolution) {
          const fetchedJoinedState = address ? await fetchEvaluatorHasJoinedSolutionState(address as `0x${string}`, solutionId) : false
          setEvaluatorHasJoined(fetchedJoinedState);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, [joining])

  return (
    <>
      {address && (
        isLoading ? (
          <div>
            <SolutionDetailsSkeleton />
          </div>
        ) : (solutionReviewPool && challenge) ? (
          <div>
            <Toaster position="top-right" richColors />

            <Button
              variant="outline"
              size="sm"
              className="mb-6 gap-1 text-muted-foreground hover:text-foreground bg-gray-200 cursor-pointer"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Solutions
            </Button>

            <div className="space-y-8">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold break-all">{challenge.title}</h1>
                </div>

                {
                  evaluatorHasJoined ? (
                    <Button
                      size="lg"
                      className="shrink-0 bg-green-600 hover:bg-green-700 text-white gap-2"
                      disabled
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Joined Evaluation
                    </Button>
                  ) : solutionReviewPool.numberOfEvaluators == solutionReviewPool.totalEvaluators ? (
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
                      className="shrink-0 bg-zinc-700 text-white cursor-pointer"
                      onClick={handleJoinEvaluation}
                      disabled={joining}
                    >
                      Evaluate Solution
                    </Button>
                  )
                }
              </div>

              {/* Workspace section */}
              <Tabs defaultValue="information">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="information" className="cursor-pointer">Challenge Information</TabsTrigger>
                  <TabsTrigger value="solution" className="cursor-pointer">Solution</TabsTrigger>
                </TabsList>
                {/* Challenge info section */}
                <TabsContent value="information" className="space-y-8">
                  <Separator className='bg-black' />

                  {/* General info section */}
                  <h2 className="text-xl font-bold">General Info</h2>

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
                        <span>{challenge.completed} completed</span>
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

                  {/* Description Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">Description</h2>
                    <RichTextEditor value={challenge.description} editable={false} />
                  </div>
                </TabsContent>

                {/* Solution section */}
                <TabsContent value="solution" className="space-y-8">
                  <Separator className='bg-black' />

                  {/* General info section */}
                  <h2 className="text-xl font-bold">General Info</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Submitter</span>
                      <div className="flex items-center gap-1.5">
                        <UserRoundPen className="h-full max-h-4 w-full max-w-4" />
                        <span className="ml-1 text-indigo-800 dark:text-indigo-300 break-all">
                          {solutionReviewPool.solution.user}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Submission Date</span>
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-full max-h-4 w-full max-w-4" />
                        <span>{epochToDateTimeString(solutionReviewPool.solution.submittedAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Evaluators</span>
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-full max-h-4 w-full max-w-4" />
                        <span>{solutionReviewPool.numberOfEvaluators} / {solutionReviewPool.totalEvaluators} joined</span>
                      </div>
                    </div>
                  </div>

                  <Separator className='bg-black' />
                  {/* Solution section */}
                  <h2 className="text-xl font-bold">Solution</h2>

                  <RichTextEditor
                    value={solutionReviewPool.solution.solution}
                    className="min-h-80 border-black dark:border-white border-1 rounded-md bg-slate-50 py-2 px-3 dark:bg-blue-950/15 break-all"
                    editable={false}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div >
        ) : (
          <div></div>
        )
      )
      }
    </>
  );
}