"use client";

// Import hooks - only import what's needed
import { useForm } from "react-hook-form";
import { useAccount, useWriteContract } from "wagmi";
import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";

// Import external UI components - optimize imports
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Lazy load heavy components
const ChallengeContent = lazy(() => 
  import("@/components/challenge-content").then(module => ({ 
    default: module.ChallengeContent 
  }))
);
const ReviewFormSection = lazy(() => import("./review-form-section"));
const ReviewDetailsSection = lazy(() => import("./review-details-section"));

// Import utils - optimize imports
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { ChallengeInterface, ModeratorReview } from "@/lib/interfaces";
import { ChallengeDifficultyLevel, Domain, QualityFactorAnswer } from "@/constants/system";

// Import icons - only load what's needed
import { ArrowLeftCircle, Loader2 } from "lucide-react";

// Import data fetching utilities
import {
  getChallengeById,
  getChallengeFinalizedStatus,
  getModeratorReviewOfChallenge,
  getReviewPoolSize,
  getReviewQuorum,
} from "@/lib/fetching-onchain-data-utils";

// Import data mutation utilities
import {
  saveModeratorReviewDraft,
  submitModeratorReview,
} from "@/lib/write-onchain-utils";

// Schema for the review form
const reviewChallengeSchema = z.object({
  relevance: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(z.nativeEnum(QualityFactorAnswer)),
  technical_correctness: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(z.nativeEnum(QualityFactorAnswer)),
  completeness: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(z.nativeEnum(QualityFactorAnswer)),
  clarity: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(z.nativeEnum(QualityFactorAnswer)),
  originality: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(z.nativeEnum(QualityFactorAnswer)),
  unbiased: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(z.nativeEnum(QualityFactorAnswer)),
  plagiarism_free: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(z.nativeEnum(QualityFactorAnswer)),

  suggested_difficulty: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(
      z.nativeEnum(ChallengeDifficultyLevel, {
        errorMap: () => ({ message: "Select difficulty level" }),
      })
    ),
  suggested_category: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(
      z.nativeEnum(Domain, {
        errorMap: () => ({ message: "Category is required" }),
      })
    ),
  suggested_solve_time: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .min(1, "Must be at least 1 minute"),
  stake_amount: z.coerce
    .number({ invalid_type_error: "Stake amount is required" })
    .gt(0, "Stake must be greater than 0"),
});

export type ModeratorReviewValues = z.infer<typeof reviewChallengeSchema>;

interface ReviewChallengeFormProps {
  challenge_id: number;
}

export function ReviewChallengeForm({
  challenge_id,
}: ReviewChallengeFormProps) {
  const { address } = useAccount();
  const router = useRouter();
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChallengeFinalized, setIsChallengeFinalized] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [moderatorReview, setModeratorReview] = useState<ModeratorReview | null>();
  const { data: hash, isPending } = useWriteContract();
  const [activeTab, setActiveTab] = useState("challenge");
  const [challenge, setChallenge] = useState<ChallengeInterface | null>(null);
  
  // Use memoized form setup to prevent unnecessary re-renders
  const form = useForm<ModeratorReviewValues>({
    resolver: zodResolver(reviewChallengeSchema),
    defaultValues: {
      relevance: undefined,
      technical_correctness: undefined,
      completeness: undefined,
      clarity: undefined,
      originality: undefined,
      unbiased: undefined,
      plagiarism_free: undefined,
      suggested_difficulty: undefined,
      suggested_category: undefined,
      suggested_solve_time: 1,
      stake_amount: 0.1,
    },
  });
  
  // Only watch form values when needed
  const reviewValues = useMemo(() => form.watch(), [form]);
  // Optimize data fetching with useEffect cleanup and better dependency management
  useEffect(() => {
    let isMounted = true;
    
    async function fetchChallenge() {
      try {
        const challenge = await getChallengeById(challenge_id);
        if (isMounted) {
          if (challenge) {
            setChallenge(challenge);
          } else {
            toast.error("Failed to fetch challenge data.");
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Error fetching challenge data");
          setIsLoading(false);
        }
      }
    }

    fetchChallenge();
    
    return () => { isMounted = false; };
  }, [challenge_id]);

  // Fetch existing moderator review and populate form - with cleanup
  useEffect(() => {
    let isMounted = true;
    
    async function fetchReview() {
      if (!address) return;
      try {
        const review = await getModeratorReviewOfChallenge(
          challenge_id,
          address as `0x${string}`
        );
        
        if (isMounted && review) {
          setIsSubmitted(review.is_submitted);
          form.reset({
            relevance: review.relevance,
            technical_correctness: review.technical_correctness,
            completeness: review.completeness,
            clarity: review.clarity,
            originality: review.originality,
            unbiased: review.unbiased,
            plagiarism_free: review.plagiarism_free,
            suggested_difficulty: review.suggested_difficulty,
            suggested_category: review.suggested_category,
            suggested_solve_time: review.suggested_solve_time,
          });
          setModeratorReview(review);
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Error fetching review data");
        }
      }
    }

    if (address) {
      fetchReview();
    }
    
    return () => { isMounted = false; };
  }, [address, challenge_id, form]);

  // Handle transaction status
  useEffect(() => {
    setIsSubmitDisabled(isPending);
    if (isPending) {
      toast.info("Transaction is pending. Please wait...");
    }
    if (!isPending && hash) {
      toast.success("Challenge review submitted successfully!");
      router.push("/dashboard/moderation"); // Redirect to moderation dashboard
    }
  }, [isPending, hash, router]);

  // Fetch review pool size and quorum only when needed
  useEffect(() => {
    let isMounted = true;
    
    async function fetchPoolInfo() {
      if (activeTab !== 'details') return; // Only fetch when details tab is active
      
      try {
        const [, , is_finalized] = await Promise.all([
          getReviewPoolSize(Number(challenge_id)),
          getReviewQuorum(),
          getChallengeFinalizedStatus(Number(challenge_id)),
        ]);
        
        if (isMounted) {
          setIsChallengeFinalized(is_finalized);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(`Error fetching review pool info: ${error}`);
        }
      }
    }
    
    fetchPoolInfo();
    
    return () => { isMounted = false; };
  }, [challenge_id, activeTab]);
  // Memoize handlers to prevent unnecessary re-renders
  const onSaveDraft = useMemo(() => async () => {
    if (isSubmitted) {
      toast.error("Cannot save draft: Review already submitted.");
      return;
    }
    const review_data = form.getValues();
    const review_data_json = JSON.stringify(review_data);
    try {
      setIsSavingDraft(true);
      await saveModeratorReviewDraft(
        challenge_id,
        address as `0x${string}`,
        review_data_json
      );
      toast.success("Draft saved successfully!");
    } catch (error) {
      toast.error("Failed to save draft");
    }
    setIsSavingDraft(false);
  }, [isSubmitted, form, challenge_id, address]);

  const onSubmit = useMemo(() => async (data: ModeratorReviewValues) => {
    setIsSubmitDisabled(true);

    try {
      await submitModeratorReview(challenge_id, address as `0x${string}`, data);
      router.back();
      toast.success("Review submitted successfully!");
    } catch (error: any) {
      if (error.shortMessage) {
        toast.error(error.shortMessage);
      }
      else if (error.message) {
        toast.error(error.message);
      }
      else {
        toast.error("An error occurred while submitting the review.");
      }
    }
    setIsSubmitDisabled(false);
  }, [challenge_id, address, router]);

  const handleGoBack = useMemo(() => () => {
    router.back();
  }, [router]);
  // Memoize UI components that don't need to re-render often
  const backButton = useMemo(() => (
    <Button
      variant="outline"
      size="sm"
      className="mb-6 gap-1 text-muted-foreground hover:text-foreground bg-gray-200 cursor-pointer"
      onClick={handleGoBack}
    >
      <ArrowLeftCircle className="h-4 w-4" />
      Back to My Reviews
    </Button>
  ), [handleGoBack]);
  
  const loadingIndicator = useMemo(() => (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ), []);
  
  const tabsList = useMemo(() => (
    <TabsList className="grid w-full grid-cols-3 mb-2">
      <TabsTrigger value="challenge">About the challenge</TabsTrigger>
      <TabsTrigger value="review">Review Form</TabsTrigger>
      <TabsTrigger value="details">Review Info</TabsTrigger>
    </TabsList>
  ), []);
  
  return (
    <div>
      {backButton}      {isLoading ? loadingIndicator : (
        <div className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {tabsList}            <TabsContent value="challenge">
              <Suspense fallback={loadingIndicator}>
                <ChallengeContent challenge={challenge} reload={isPending} className="bg-muted/40 p-6 rounded-lg shadow-md" />
              </Suspense>
            </TabsContent>
            <TabsContent value="review">
              <Suspense fallback={loadingIndicator}>
                <ReviewFormSection
                  form={form}
                  isSubmitted={isSubmitted}
                  isSavingDraft={isSavingDraft}
                  isSubmitDisabled={isSubmitDisabled || isPending}
                  isChallengeFinalized={isChallengeFinalized}
                  onSaveDraft={onSaveDraft}
                  onSubmit={onSubmit}
                />
              </Suspense>
            </TabsContent>
            <TabsContent value="details">
              <Suspense fallback={loadingIndicator}>
                <ReviewDetailsSection moderatorReview={moderatorReview} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
