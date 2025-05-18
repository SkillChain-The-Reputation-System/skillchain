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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Import utils
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { ChallengeInterface, ModeratorReview } from "@/lib/interfaces";
import {
  ChallengeDifficultyLevel,
  Domain,
  DomainLabels,
  QualityFactorAnswer,
} from "@/constants/system";
import {
  ArrowLeftCircle,
  CheckCircle,
  Clock,
  Hash,
  Link2,
  Loader2,
  Save,
  Send,
  Star,
  User,
} from "lucide-react";
import {
  getChallengeById,
  getChallengeFinalizedStatus,
  getModeratorReviewOfChallenge,
  getReviewPoolSize,
  getReviewQuorum,
} from "@/lib/fetching-onchain-data-utils";
import { quality_factors_questions } from "@/constants/data";
import {
  saveModeratorReviewDraft,
  submitModeratorReview,
  waitForTransaction,
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
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false); // For disabling the button "Submit"
  const [isSavingDraft, setIsSavingDraft] = useState(false); // For disabling the button "Save Draft"
  const [isLoading, setIsLoading] = useState(true);
  const [isChallengeFinalized, setIsChallengeFinalized] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [moderatorReview, setModeratorReview] =
    useState<ModeratorReview | null>();
  const { data: hash, isPending } = useWriteContract();
  const [activeTab, setActiveTab] = useState("challenge");

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
  const reviewValues = form.watch();

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
      }
      setModeratorReview(review);
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
          getChallengeFinalizedStatus(Number(challenge_id)),
        ]);
        setIsChallengeFinalized(is_finalized);
      } catch (error) {
        toast.error(`Error fetching review pool info: ${error}`);
      }
    }
    fetchPoolInfo();
  }, [address, challenge_id, form]);

  async function onSaveDraft() {
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
  }

  async function onSubmit(data: ModeratorReviewValues) {
    setIsSubmitDisabled(true);

    try {
      const tx = await submitModeratorReview(challenge_id, address as `0x${string}`, data);
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
  }

  function handleGoBack() {
    router.back();
  }

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className="mb-6 gap-1 text-muted-foreground hover:text-foreground bg-gray-200 cursor-pointer"
        onClick={handleGoBack}
      >
        <ArrowLeftCircle className="h-4 w-4" />
        Back to My Reviews
      </Button>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="challenge">About the challenge</TabsTrigger>
              <TabsTrigger value="review">Review Form</TabsTrigger>
              <TabsTrigger value="details">Review Info</TabsTrigger>
            </TabsList>
            <TabsContent value="challenge">
              <Separator className="bg-black" />
              <ChallengeContent challenge={challenge} reload={isPending} />
            </TabsContent>
            <TabsContent value="review">
              <div className="bg-muted/40 p-6 rounded-lg shadow-md mt-2">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
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
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                {/* Left: Question */}
                                <div>
                                  <FormLabel>
                                    {index + 1}. {q.label}
                                  </FormLabel>
                                  <FormDescription>
                                    {q.description}
                                  </FormDescription>
                                </div>
                                {/* Right: Controls */}
                                <div>
                                  <FormControl>
                                    <ToggleGroup
                                      type="single"
                                      className="grid grid-cols-2 gap-2 mt-2"
                                      value={field.value?.toString()}
                                      onValueChange={field.onChange}
                                      aria-label={q.label}
                                      disabled={isSubmitted}
                                      defaultChecked={true}
                                      defaultValue={field.value?.toString()}
                                    >
                                      <ToggleGroupItem
                                        value={QualityFactorAnswer.YES.toString()}
                                        className={cn(
                                          "px-4 py-2 rounded-md text-center transition-all border-2 select-none",
                                          field.value?.toString() ===
                                            QualityFactorAnswer.YES.toString()
                                            ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-400 dark:text-white dark:border-blue-500 shadow-lg scale-105"
                                            : "bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-200 hover:border-blue-400 dark:hover:bg-blue-900 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        )}
                                      >
                                        Yes
                                      </ToggleGroupItem>

                                      <ToggleGroupItem
                                        value={QualityFactorAnswer.NO.toString()}
                                        className={cn(
                                          "px-4 py-2 rounded-md text-center transition-all border-2 select-none",
                                          field.value?.toString() ===
                                            QualityFactorAnswer.NO.toString()
                                            ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-400 dark:text-white dark:border-blue-500 shadow-lg scale-105"
                                            : "bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-200 hover:border-blue-400 dark:hover:bg-blue-900 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        )}
                                      >
                                        No
                                      </ToggleGroupItem>
                                    </ToggleGroup>
                                  </FormControl>
                                  <FormMessage />
                                </div>
                              </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                              <div>
                                <FormLabel>Difficulty Level</FormLabel>
                              </div>
                              <div>
                                <FormControl>
                                  <ToggleGroup
                                    type="single"
                                    className="flex space-x-4"
                                    value={field.value?.toString()}
                                    onValueChange={field.onChange}
                                    aria-label="Difficulty Level"
                                    disabled={isSubmitted}
                                    defaultValue={field.value?.toString()}
                                  >
                                    <ToggleGroupItem
                                      value={ChallengeDifficultyLevel.EASY.toString()}
                                      className={cn(
                                        "px-4 py-2 rounded-md text-center transition-all border-2 select-none",
                                        field.value?.toString() ===
                                          ChallengeDifficultyLevel.EASY.toString()
                                          ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-400 dark:text-white dark:border-blue-500 shadow-lg scale-105"
                                          : "bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-200 hover:border-blue-400 dark:hover:bg-blue-900 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      )}
                                    >
                                      Easy
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                      value={ChallengeDifficultyLevel.MEDIUM.toString()}
                                      className={cn(
                                        "px-4 py-2 rounded-md text-center transition-all border-2 select-none",
                                        field.value?.toString() ===
                                          ChallengeDifficultyLevel.MEDIUM.toString()
                                          ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-400 dark:text-white dark:border-blue-500 shadow-lg scale-105"
                                          : "bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-200 hover:border-blue-400 dark:hover:bg-blue-900 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      )}
                                    >
                                      Medium
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                      value={ChallengeDifficultyLevel.HARD.toString()}
                                      className={cn(
                                        "px-4 py-2 rounded-md text-center transition-all border-2 select-none",
                                        field.value?.toString() ===
                                          ChallengeDifficultyLevel.HARD.toString()
                                          ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-400 dark:text-white dark:border-blue-500 shadow-lg scale-105"
                                          : "bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-200 hover:border-blue-400 dark:hover:bg-blue-900 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      )}
                                    >
                                      Hard
                                    </ToggleGroupItem>
                                  </ToggleGroup>
                                </FormControl>
                                <FormMessage />
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                      {/* Category */}
                      <FormField
                        control={form.control}
                        name="suggested_category"
                        render={({ field }) => (
                          <FormItem>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                              <div>
                                <FormLabel>Category</FormLabel>
                              </div>
                              <div>
                                <Select
                                  value={field.value?.toString() ?? ""}
                                  onValueChange={(val) =>
                                    field.onChange(Number(val))
                                  }
                                  disabled={isSubmitted}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-[300px] hover:border-blue-500 border-2 border-gray-300 dark:border-gray-800 shadow-lg select-none">
                                      <SelectValue placeholder="Select category of your challenge" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="w-[300px] ">
                                    {
                                      // get the numeric enum members
                                      (
                                        Object.values(
                                          Domain
                                        ) as unknown as number[]
                                      )
                                        .filter((v) => typeof v === "number")
                                        .map((num) => (
                                          <SelectItem
                                            key={num}
                                            value={num.toString()}
                                          >
                                            {DomainLabels[num as Domain]}
                                          </SelectItem>
                                        ))
                                    }
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                      {/* Estimated Solve Time */}
                      <FormField
                        control={form.control}
                        name="suggested_solve_time"
                        render={({ field }) => (
                          <FormItem>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                              <div>
                                <FormLabel>
                                  Estimated Solve Time (minutes)
                                </FormLabel>
                              </div>
                              <div>
                                <FormControl>
                                  <Input
                                    type="number"
                                    disabled={isSubmitted}
                                    min={1}
                                    {...field}
                                    className="border-2 hover:border-blue-500 border-gray-300 dark:border-gray-800 focus-visible:border-blue-500 focus:ring-0 shadow-lg"
                                  />
                                </FormControl>
                                <FormMessage />
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {!isSubmitted ? (
                      <div className="grid md:flex justify-center items-center gap-2 m-5">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onSaveDraft}
                          disabled={isSavingDraft || isChallengeFinalized}
                          className="gap-2 cursor-pointer border border-zinc-700"
                        >
                          <Save className="h-4 w-4" />
                          Save Draft
                        </Button>

                        <Button
                          type="submit"
                          disabled={isSubmitDisabled || isChallengeFinalized}
                          className="gap-2 cursor-pointer shrink-0 bg-zinc-700 hover:bg-zinc-700/60 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/60"
                        >
                          <Send className="h-4 w-4" />
                          Submit Review
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-green-100 dark:bg-muted/70 p-6 rounded-lg">
                        <div>
                          <h3 className="font-semibold">
                            You've submitted your review!
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Thank you for your feedback!
                          </p>
                        </div>

                        <Button
                          size="lg"
                          className="shrink-0 bg-green-600 hover:bg-green-700 text-white gap-2 cursor-pointer"
                          onClick={handleGoBack}
                          type="button"
                        >
                          <ArrowLeftCircle className="h-4 w-4" />
                          Review other challenges
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </div>
            </TabsContent>
            <TabsContent value="details">
              <Separator className="bg-black" />
              <div className="bg-muted/40 p-6 rounded-lg shadow-md mt-2">
                <div className="grid grid-cols-1 gap-y-4">
                  {/* Moderator */}
                  <div className="grid grid-cols-[32px_140px_1fr] items-center gap-x-2">
                    <User className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold min-w-[120px]">
                      Moderator:
                    </span>
                    <span
                      className="truncate"
                      title={moderatorReview?.moderator}
                    >
                      {moderatorReview?.moderator || "-"}
                    </span>
                  </div>
                  {/* Challenge ID */}
                  <div className="grid grid-cols-[32px_140px_1fr] items-center gap-x-2">
                    <Hash className="w-5 h-5 text-green-500" />
                    <span className="font-semibold min-w-[120px]">
                      Challenge ID:
                    </span>
                    <span>{moderatorReview?.challenge_id ?? "-"}</span>
                  </div>
                  {/* Review Time */}
                  <div className="grid grid-cols-[32px_140px_1fr] items-center gap-x-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold min-w-[120px]">
                      Review Time:
                    </span>
                    <span className="truncate">
                      {moderatorReview?.review_time
                        ? new Date(
                            moderatorReview.review_time * 1000
                          ).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                  {/* Review TxID */}
                  <div className="grid grid-cols-[32px_140px_1fr] items-center gap-x-2">
                    <Link2 className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold min-w-[120px]">
                      Review TxID:
                    </span>
                    <span
                      className="truncate"
                      title={moderatorReview?.review_txid}
                    >
                      {moderatorReview?.review_txid || "-"}
                    </span>
                  </div>
                  {/* Submitted */}
                  <div className="grid grid-cols-[32px_140px_1fr] items-center gap-x-2">
                    <CheckCircle
                      className={`w-5 h-5 ${
                        moderatorReview?.is_submitted
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="font-semibold min-w-[120px]">
                      Submitted:
                    </span>
                    <span>{moderatorReview?.is_submitted ? "Yes" : "No"}</span>
                  </div>
                  {/* Review Score */}
                  <div className="grid grid-cols-[32px_140px_1fr] items-center gap-x-2">
                    <Star className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold min-w-[120px]">
                      Review Score:
                    </span>
                    <span>{moderatorReview?.review_score ?? "-"}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
