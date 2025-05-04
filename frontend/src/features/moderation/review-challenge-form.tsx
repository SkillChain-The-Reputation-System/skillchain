"use client";

// Import hooks
import { useForm } from "react-hook-form";
import { useAccount, useWriteContract } from "wagmi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Import external UI components
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChallengeContent } from "@/components/challenge-content";

// Import utils
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { ChallengeInterface } from "@/lib/interfaces";
import { 
  ChallengeDifficultyLevel,
  Domain,
  DomainLabels,
  QualityFactorAnswer,
} from "@/constants/system";
import { Loader2 } from "lucide-react";
import {
  getChallengeById,
  getChallengeFinalizedStatus,
  getModeratorReviewOfChallenge,
  getReviewPoolSize,
  getReviewQuorum,
} from "@/lib/fetching-onchain-data-utils";
import { quality_factors_questions } from "@/constants/data";
import { submitModeratorReview } from "@/lib/write-onchain-utils";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isChallengeFinalized, setIsChallengeFinalized] = useState(false);
  const { data: hash, isPending } = useWriteContract();

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
    },
  });

  const [challenge, setChallenge] = useState<ChallengeInterface | null>(null);

  useEffect(() => {
    async function fetchChallenge() {
      const challenge = await getChallengeById(challenge_id);
      if (challenge) {
        setChallenge(challenge);
      } else {
        toast.error("Failed to fetch challenge data.");
      }
      setIsLoading(false);
    }

    fetchChallenge();
  }, []);

  // Fetch existing moderator review and populate form
  useEffect(() => {
    async function fetchReview() {
      if (!address) return;
      const review = await getModeratorReviewOfChallenge(
        challenge_id,
        address as `0x${string}`
      );
      if (review) {
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
      }
    }

    fetchReview();
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

    // Fetch review pool size and quorum when the details dialog is opened, or when the challenge ID changes
    useEffect(() => {
      async function fetchPoolInfo() {
        try {
          const [size, q, is_finalized] = await Promise.all([
            getReviewPoolSize(Number(challenge_id)),
            getReviewQuorum(),
            getChallengeFinalizedStatus(Number(challenge_id))
          ]);
          setIsChallengeFinalized(is_finalized);
        } catch (error) {
          toast.error(`Error fetching review pool info: ${error}`);
        }
      }
      fetchPoolInfo();
    }, [address, challenge_id, form]);

  async function onSubmit(data: ModeratorReviewValues) {
    setIsSubmitDisabled(true);

    try {
      await submitModeratorReview(challenge_id, address as `0x${string}`, data);
      toast.success("Review submitted successfully!");
      router.back(); // Go back to the previous page
    } catch (error) {
      toast.error("Failed to submit review");
    }
    setIsSubmitDisabled(false);
  }

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          <ChallengeContent
            challenge={challenge}
            reload={isPending}
          />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Quality Factors Group */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Quality Factors</h3>
                {quality_factors_questions.map((q, index) => (
                  <FormField
                    key={q.name}
                    control={form.control}
                    name={q.name as keyof ModeratorReviewValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {index + 1}. {q.label}
                        </FormLabel>
                        <FormDescription>{q.description}</FormDescription>
                        <FormControl>
                          <RadioGroup
                            value={field.value?.toString()}
                            onValueChange={field.onChange}
                            className="flex space-x-4"
                          >
                            <RadioGroupItem
                              value={QualityFactorAnswer.YES.toString()}
                              id={QualityFactorAnswer.YES.toString()}
                            />
                            <Label htmlFor={`${q.name}-yes`}>Yes</Label>
                            <RadioGroupItem
                              value={QualityFactorAnswer.NO.toString()}
                              id={QualityFactorAnswer.NO.toString()}
                            />
                            <Label htmlFor={`${q.name}-no`}>No</Label>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* Suggestion Group */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Suggestions</h3>
                {/* Difficulty Level */}
                <FormField
                  control={form.control}
                  name="suggested_difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value?.toString()}
                          onValueChange={field.onChange}
                          className="flex space-x-4"
                        >
                          <RadioGroupItem
                            value={ChallengeDifficultyLevel.EASY.toString()}
                            id={ChallengeDifficultyLevel.EASY.toString()}
                          />
                          <Label htmlFor="difficulty-easy">Easy</Label>
                          <RadioGroupItem
                            value={ChallengeDifficultyLevel.MEDIUM.toString()}
                            id={ChallengeDifficultyLevel.MEDIUM.toString()}
                          />
                          <Label htmlFor="difficulty-medium">Medium</Label>
                          <RadioGroupItem
                            value={ChallengeDifficultyLevel.HARD.toString()}
                            id={ChallengeDifficultyLevel.HARD.toString()}
                          />
                          <Label htmlFor="difficulty-hard">Hard</Label>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Category */}
                <FormField
                  control={form.control}
                  name="suggested_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={field.value?.toString() ?? ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Select category of your challenge" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-[300px]">
                          {
                            // get the numeric enum members
                            (Object.values(Domain) as unknown as number[])
                              .filter((v) => typeof v === "number")
                              .map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {DomainLabels[num as Domain]}
                                </SelectItem>
                              ))
                          }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Estimated Solve Time */}
                <FormField
                  control={form.control}
                  name="suggested_solve_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Solve Time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={isSubmitDisabled || isChallengeFinalized}
                  className="flex-1"
                >
                  Submit Review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
