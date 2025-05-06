'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';

import { ArrowLeft, Calendar, Clock, Star, Tag, UserRoundPen, Users } from "lucide-react";

import { ChallengeInterface } from '@/lib/interfaces';
import { getChallengeById } from "@/lib/fetching-onchain-data-utils";
import { Separator } from '@/components/ui/separator';
import { DomainLabels, Domain, ChallengeDifficultyLevel, ChallengeDifficultyLevelLabels, ChallengeStatus } from '@/constants/system';
import { difficultyStyles } from '@/constants/styles'
import { epochToDateString } from "@/lib/time-utils";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ChallengeDetailsSkeleton from './challenge-details-skeleton'
import { pageUrlMapping } from "@/constants/navigation";
import { renderMathInElement } from "@/lib/katex-auto-render";
import "katex/dist/katex.min.css";

interface ExploreChallengeDetailsProps {
  challenge_id: number;
}

export default function ExploreChallengeDetails({ challenge_id }: ExploreChallengeDetailsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [challenge, setChallenge] = useState<ChallengeInterface | null>(null);
  const katexRef = useRef<HTMLDivElement>(null);

  const handleJoinChallenge = () => {
    // handle user join a challenge here
  }

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const fetchedChallenge = await getChallengeById(challenge_id);
        setChallenge(fetchedChallenge);
      } catch (error) {
        console.error("Error fetching this challenge:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (katexRef.current) {
          renderMathInElement(katexRef.current);
        }
      }, 0); // Delay for DOM

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <>
      {isLoading ? (
        <div>
          <ChallengeDetailsSkeleton />
        </div>
      ) : challenge && challenge.status == ChallengeStatus.APPROVED ? (
        <div>
          <Button
            variant="outline"
            size="sm"
            className="mb-6 gap-1 text-muted-foreground hover:text-foreground bg-gray-200 cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Button>

          <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{challenge.title}</h1>
              </div>
              <Button size="lg" className="shrink-0 bg-zinc-700 text-white cursor-pointer" onClick={handleJoinChallenge}>
                Join Challenge
              </Button>
            </div>

            <Separator className='bg-black' />

            {/* Info Section */}
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
                  <Calendar className="h-full max-h-4 w-full max-w-4" />
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
              <h2 className="text-xl font-bold">Challenge Description</h2>
              <div
                ref={katexRef}
                className="dark:text-gray-100 editor"
                dangerouslySetInnerHTML={{ __html: challenge.description || "" }}
              />
            </div>

            {/* Action Section */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/50 p-6 rounded-lg">
              <div>
                <h3 className="font-semibold">Ready to take on this challenge?</h3>
                <p className="text-sm text-muted-foreground">Join now and start working on your solution.</p>
              </div>
              <Button size="lg" className="shrink-0 bg-zinc-700 text-white cursor-pointer" onClick={handleJoinChallenge}>
                Join Challenge
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center object-center py-12">
          <h2 className="text-xl font-semibold mb-2">Challenge not found</h2>
          <p className="text-muted-foreground mb-6">
            The challenge you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push(pageUrlMapping.participation_explore)}>Return to Explore</Button>
        </div>
      )
      }
    </>
  )
}