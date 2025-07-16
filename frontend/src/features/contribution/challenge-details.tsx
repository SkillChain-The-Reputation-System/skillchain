"use client";

// Import hooks
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

// Import UI components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal,
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
import ModerationDetails from "@/components/moderation-details";
import { ChallengeRevenueInfo } from "@/components/challenge-revenue-info";

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
  const [selectedAction, setSelectedAction] = useState<'edit' | 'contribute' | null>(null);

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
      setSelectedAction(null);
    }
  };

  const handleActionSelect = (action: 'edit' | 'contribute') => {
    setSelectedAction(action);
    if (action === 'edit') {
      router.push(pathname + `/edit`);
    } else if (action === 'contribute') {
      setIsDialogOpen(true);
    }
  };

  return isLoading ? (
    <div className="space-y-8">
      {/* Header Card Skeleton */}
      <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between w-full">
            <Skeleton className="h-7 w-64" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* General Info Card Skeleton */}
      <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700">
        <Skeleton className="h-7 w-32 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Description Card Skeleton */}
      <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700 space-y-4">
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

      {/* Additional Info Cards Skeleton */}
      <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
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
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedAction(null);
              }}
              disabled={contributing}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
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

      <div className="space-y-8">
        {/* Header Section as Card */}
        <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-xl font-bold break-all text-slate-900 dark:text-slate-100">{challenge.title}</h1>
              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    statusStyles[challenge.status as ChallengeStatus],
                    "text-sm font-bold"
                  )}
                >
                  {ChallengeStatusLabels[challenge.status as ChallengeStatus]}
                </Badge>
                {challenge.status === ChallengeStatus.DRAFT && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={contributing}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleActionSelect('edit')}
                      >
                        <SquarePen className="h-4 w-4" />
                        <span>Edit Challenge</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleActionSelect('contribute')}
                        disabled={contributing}
                      >
                        <Send className="h-4 w-4" />
                        <span>Contribute Challenge</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About challenge section */}
        <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">General Info</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">
                Domain
              </span>
              <div className="flex items-center gap-1.5">
                <Tag className="h-full max-h-4 w-full max-w-4" />
                <span className="ml-1">{DomainLabels[challenge.category as Domain]}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">
                Quality Score
              </span>
              <div className="flex items-center gap-1.5">
                {challenge.status === ChallengeStatus.APPROVED ||
                challenge.status === ChallengeStatus.REJECTED ? (
                  <>
                    <Star className="h-full max-h-4 w-full max-w-4 text-amber-500 fill-current" />
                    <span>{challenge.qualityScore} / 100</span>
                  </>
                ) : (
                  <Badge variant="secondary">Unrated</Badge>
                )}
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
                    <span>{format(challenge.contributeAt, "PPP")}</span>
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
                      "capitalize px-2 py-1 rounded-lg",
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
        </div>

        {/* Description Section */}
        <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700 space-y-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Challenge Description</h1>
          <RichTextEditor
            value={challenge.description || `No description provided`}
            editable={false}
            className={cn(!challenge.description && "italic text-muted-foreground")}
          />
        </div>

        {challenge.status !== ChallengeStatus.DRAFT && (
          <>
            {/* Challenge Info Section */}
            <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700 space-y-4">
              <ChallengePotInfo challengeId={id} />
            </div>

            {/* Moderation Details Section */}
            <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700 space-y-4">
              <ModerationDetails challenge={challenge} />
            </div>

            {challenge.status === ChallengeStatus.APPROVED && (
              <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700 space-y-4">
                <ChallengeRevenueInfo challengeId={id} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  ) : (
    <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-12 border border-slate-200 dark:border-slate-700 text-center">
      <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">Challenge not found</h2>
      <p className="text-muted-foreground mb-6">
        The challenge you're looking for doesn't exist or has been removed.
      </p>
      <Button onClick={() => router.back()}>
        Go Back
      </Button>
    </div>
  );
}
