'use client'

// Import hooks
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from 'react'
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
  ArrowLeft,
  CalendarArrowUp,
  Clock,
  Star,
  Tag,
  UserRoundPen,
  Users,
  CalendarCheck,
  Eye,
  Trophy,
  Save,
  Send
} from "lucide-react";

// Import utils
import { ChallengeInterface, SolutionInterface } from '@/lib/interfaces';
import { cn } from '@/lib/utils'
import { solutionProgressStyles, difficultyStyles } from '@/constants/styles'
import { epochToDateString } from "@/lib/time-utils";
import {
  Domain,
  DomainLabels,
  ChallengeDifficultyLevel,
  ChallengeDifficultyLevelLabels,
  ChallengeSolutionProgress,
  ChallengeSolutionProgressLabels
} from '@/constants/system'
import { submitSolution, waitForTransaction } from '@/lib/write-onchain-utils'
import { getChallengeById, fetchSolutionByUserAndChallengeId } from "@/lib/fetching-onchain-data-utils";
import { renderMathInElement } from "@/lib/katex-auto-render";
import "katex/dist/katex.min.css";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageUrlMapping } from "@/constants/navigation";

const solutionSchema = z.object({
  solution: z
    .string()
    .min(17, "Solution must be at least 10 characters")
    .max(10000, "Solution must be less than 4000 characters"),
});

export type SolutionFormValues = z.infer<typeof solutionSchema>;

interface WorkspaceChallengeDetailsProps {
  challenge_id: number;
}

export default function WorkspaceChallenge({ challenge_id }: WorkspaceChallengeDetailsProps) {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [onDescription, setOnDescription] = useState(false);
  const router = useRouter();
  const [challenge, setChallenge] = useState<ChallengeInterface | null>(null);
  const [solution, setSolution] = useState<SolutionInterface | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const katexRef = useRef<HTMLDivElement>(null);

  const form = useForm<SolutionFormValues>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      solution: "",
    },
  });

  async function onSubmit(data: SolutionFormValues) {
    if (!address || !challenge || !solution) {
      return;
    }

    try {
      setSubmitting(true);
      const txHash = await submitSolution(Number(challenge_id), address, data.solution);
      await waitForTransaction(txHash);
      toast.success("You have submitted this solution");
      window.location.reload();
    } catch (error: any) {
      toast.error("Error occurs. Please try again!");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSaveDraft() {
    form.handleSubmit((data: SolutionFormValues) => {
      // maybe handle save draft here
    })();
  }

  // fetch data once
  useEffect(() => {
    const fetchData = async () => {
      if (!address)
        return;

      setIsLoading(true);
      try {
        const [
          fetchedChallenge,
          fetchedSolution
        ] = await Promise.all([
          getChallengeById(challenge_id),
          fetchSolutionByUserAndChallengeId(address, challenge_id)
        ]);

        setChallenge(fetchedChallenge);
        setSolution(fetchedSolution);
      } catch (error) {
        toast.error("Error occurs. Please try again");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [address]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onDescription && katexRef.current) {
        renderMathInElement(katexRef.current);
      }
    }, 100); // Delay for DOM

    return () => clearTimeout(timer);
  }, [onDescription]);

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
              onClick={() => router.push(pageUrlMapping.participation_workspace)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Workspace
            </Button>

            <div className="space-y-8">
              {/* Header section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{challenge.title}</h1>
                </div>

                <Badge className={cn("text-md font-bold", solutionProgressStyles[solution.progress as keyof typeof solutionProgressStyles])}>
                  {ChallengeSolutionProgressLabels[solution.progress as ChallengeSolutionProgress]}
                </Badge>
              </div>

              {/* Workspace section */}
              <Tabs defaultValue="information">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="information" className="cursor-pointer" onClick={() => setOnDescription(false)}>Information</TabsTrigger>
                  <TabsTrigger value="description" className="cursor-pointer" onClick={() => setOnDescription(true)}>Description</TabsTrigger>
                  <TabsTrigger value="solution" className="cursor-pointer" onClick={() => setOnDescription(false)}>Solution</TabsTrigger>
                </TabsList>
                <TabsContent value="information" className="space-y-8">
                  <Separator className='bg-black' />

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
                        <span>{0} enrolled</span>
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

                  <h1 className="text-xl font-bold">About your work</h1>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Joined date</span>
                      <div className="flex items-center gap-1.5">
                        <CalendarCheck className="h-full max-h-4 w-full max-w-4" />
                        <span>{epochToDateString(solution.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Reviewer</span>
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-full max-h-4 w-full max-w-4" />
                        <span>{0} joined</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">Score</span>
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-full max-h-4 w-full max-w-4 text-amber-500 dark:text-amber-400 fill-current" />
                        <span>{solution.progress != ChallengeSolutionProgress.REVIEWED ? "--" : "??"}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="description" className="space-y-8">
                  <Separator className='bg-black' />

                  <div className="space-y-4">
                    <div
                      ref={katexRef}
                      className="dark:text-gray-100 editor"
                      dangerouslySetInnerHTML={{ __html: challenge.description || "" }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="solution">
                  <Separator className='bg-black' />

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="w-full mt-8 space-y-8"
                    >
                      <FormField
                        control={form.control}
                        name="solution"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RichTextEditor
                                value={solution.progress == ChallengeSolutionProgress.IN_PROGRESS ? field.value : solution.solution!}
                                onChange={field.onChange}
                                className="min-h-80 border-black dark:border-white border-1 rounded-md bg-slate-50 py-2 px-3 dark:bg-blue-950/15 break-all"
                                placeholder="What is your solution about this challenge..."
                                editable={solution.progress == ChallengeSolutionProgress.IN_PROGRESS}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end items-center gap-5">
                        {
                          (solution.progress == ChallengeSolutionProgress.IN_PROGRESS) &&
                          <Button
                            variant="outline"
                            size="lg"
                            className="flex items-center gap-2 cursor-pointer border border-zinc-700"
                            onClick={onSaveDraft}
                          >
                            <Save className="h-4 w-4" />
                            Save draft
                          </Button>
                        }

                        <Button
                          variant="outline"
                          type="submit"
                          size="lg"
                          className="flex items-center gap-2 cursor-pointer shrink-0 bg-zinc-700 hover:bg-zinc-700/60 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/60"
                          disabled={submitting || solution.progress != ChallengeSolutionProgress.IN_PROGRESS}
                        >
                          <Send className="h-4 w-4" />
                          Submit
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div>

          </div>
        )
      )}
    </>
  )
}
