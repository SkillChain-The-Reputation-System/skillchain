"use client";

// Import hooks
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

// Import UI components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import RichTextEditor from "@/components/rich-text-editor";

// Import lucide-react icons
import {
  CalendarArrowUp,
  CircleDollarSign,
  Clock,
  LoaderCircle,
  Send,
  SquarePen,
  Star,
  Tag,
  Users,
} from "lucide-react";

// Import utils
import { difficultyStyles, statusStyles } from "@/constants/styles";
import {
  ChallengeDifficultyLevel,
  ChallengeDifficultyLevelLabels,
  ChallengeStatus,
  ChallengeStatusLabels,
  Domain,
  DomainLabels,
} from "@/constants/system";
import { getErrorMessage } from "@/lib/error-utils";
import { getChallengeById } from "@/lib/fetching-onchain-data-utils";
import { ChallengeInterface } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { contributeChallenge } from "@/lib/write-onchain-utils";
import { Toaster, toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ChallengePotInfo } from "@/components/challenge-pot-info";

interface ChallengeDetailsProps {
  id: `0x${string}`;
}

export default function ChallengeDetails({ id }: ChallengeDetailsProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { address, isConnected } = useAccount();
  const [challenge, setChallenge] = useState<ChallengeInterface | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [contributing, setIsContributing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!address) {
        return;
      }

      try {
        setIsLoading(true);
        const fetchedChallenge = await getChallengeById(id);
        setChallenge(fetchedChallenge);
      } catch (error: any) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isConnected]);

  const onContribute = async () => {
    if (!address || !challenge) {
      return;
    }

    try {
      setIsContributing(true);
      const success = await contributeChallenge(address, challenge);

      if (success) {
        const fetchedChallenge = await getChallengeById(id);
        setChallenge(fetchedChallenge);
        toast.success("You've contributed this challenge");
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsContributing(false);
      setIsDialogOpen(false);
    }
  };

  return isLoading ? (
    <div className="flex flex-col gap-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2 w-full sm:w-2/3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-px w-full" />

      {/* Info Section Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>

      <Skeleton className="h-px w-full" />

      {/* Description Section Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Action Section Skeleton */}
      <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20 p-6 rounded-lg">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  ) : challenge ? (
    <div>
      <Toaster position="top-right" richColors />

      <AlertDialog open={isDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">
              Confirm contributing challenge
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will pay{" "}
              <span className="text-blue-500">{challenge.bounty} ETH</span> to
              contribute this challenge. This action cannot be undone, and you
              won't be able to make any edits afterward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => setIsDialogOpen(false)}
              disabled={contributing}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              className="cursor-pointer bg-zinc-700 hover:bg-zinc-700/80 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/80"
              onClick={onContribute}
              disabled={contributing}
            >
              {contributing ? (
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between ">
        <div className="flex gap-4 items-center">
          <div className="text-3xl font-bold break-words max-w-[200px] sm:max-w-[300px] md:max-w-[700px]">
            {challenge.title}
          </div>

          <Badge
            className={cn(
              statusStyles[challenge.status as ChallengeStatus],
              "text-md font-bold"
            )}
          >
            {ChallengeStatusLabels[challenge.status as ChallengeStatus]}
          </Badge>
        </div>

        {challenge.status === ChallengeStatus.DRAFT && (
          <div className="flex gap-4 items-center">
            <Button
              className="flex gap-2 items-center"
              onClick={() => router.push(pathname + `/edit`)}
            >
              Edit
              <SquarePen />
            </Button>

            <Button
              disabled={contributing}
              className="flex gap-2 items-center bg-green-600 hover:bg-green-600/80 text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              Contribute
              <Send />
            </Button>
          </div>
        )}
      </div>

      <Separator className="my-6 bg-gray-300 dark:bg-gray-800" />

      <div className="text-xl font-bold mb-6">General Info</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Domain
          </span>
          <div className="flex items-center gap-1.5">
            <Tag className="h-full max-h-4 w-full max-w-4" />
            <span>{DomainLabels[challenge.category as Domain]}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Quality Score
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              {challenge.status === ChallengeStatus.APPROVED ||
              challenge.status === ChallengeStatus.REJECTED ? (
                <>
                  <Star className="h-full max-h-4 w-full max-w-4 text-amber-500 fill-current" />
                  {challenge.qualityScore} / 100
                </>
              ) : (
                <Badge variant="secondary">Unrated</Badge>
              )}
            </div>
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
            {challenge.contributeAt ? (
              <>
                <CalendarArrowUp className="h-full max-h-4 w-full max-w-4" />
                {format(challenge.contributeAt, "PPP")}
              </>
            ) : (
              <Badge variant="secondary">Not contributed yet</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Difficulty Level
          </span>
          <div className="flex items-center gap-1.5">
            {challenge.status === ChallengeStatus.APPROVED ||
            challenge.status === ChallengeStatus.REJECTED ? (
              <Badge
                className={cn(
                  difficultyStyles[
                    challenge.difficultyLevel as ChallengeDifficultyLevel
                  ]
                )}
              >
                {
                  ChallengeDifficultyLevelLabels[
                    challenge.difficultyLevel as ChallengeDifficultyLevel
                  ]
                }
              </Badge>
            ) : (
              <Badge variant="secondary">Unconfirmed</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Estimated solve time
          </span>
          <div className="flex items-center gap-1.5">
            {challenge.status === ChallengeStatus.APPROVED ||
            challenge.status === ChallengeStatus.REJECTED ? (
              <>
                <Clock className="h-full max-h-4 w-full max-w-4" />
                <span>{challenge.solveTime} minutes</span>
              </>
            ) : (
              <Badge variant="secondary">Unconfirmed</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Bounty Amount
          </span>
          <div className="flex items-center gap-1.5">
            <CircleDollarSign className="h-full max-h-4 w-full max-w-4" />
            <span>{challenge.bounty} ETH</span>
          </div>
        </div>
      </div>

      <Separator className="my-6 bg-gray-300 dark:bg-gray-800" />

      <div className="text-xl font-bold mb-6">Description</div>

      <RichTextEditor
        value={challenge.description || `No giving description`}
        editable={false}
        className={cn(!challenge.description && "italic text-muted-foreground")}
      />

      <Separator className="my-6 bg-gray-300 dark:bg-gray-800" />

      {challenge.status !== ChallengeStatus.DRAFT && (
        <ChallengePotInfo challengeId={id} />
      )}
    </div>
  ) : (
    <>Not found</>
  );
}
