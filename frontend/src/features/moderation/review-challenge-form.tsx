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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Import utils
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import axios from "axios";
import {
  ChallengeInterface,
  IrysUploadResponseInterface,
} from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { statusStyles } from "@/constants/styles";
import {
  ChallengeDifficultyLevel,
  ChallengeStatusLabels,
  Domain,
  DomainLabels,
  QualityFactorAnswer,
} from "@/constants/system";
import { Calendar, Clock, Users } from "lucide-react";
import { getChallengeById } from "@/lib/fetching-onchain-data-utils";
import { epochToDateString } from "@/lib/time-utils";
import { quality_factors_questions } from "@/constants/data";
import { updateModeratorReview } from "@/lib/write-onchain-utils";

// Schema for the review form
const reviewChallengeSchema = z.object({
  relevance: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(z.nativeEnum(QualityFactorAnswer)),
  correctness: z.coerce
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
  absenceBias: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(z.nativeEnum(QualityFactorAnswer)),
  noPlagiarism: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(z.nativeEnum(QualityFactorAnswer)),

  difficulty: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(
      z.nativeEnum(ChallengeDifficultyLevel, {
        errorMap: () => ({ message: "Select difficulty level" }),
      })
    ),
  category: z.coerce
    .number({
      required_error: "Answer is required",
      invalid_type_error: "Answer is required",
    })
    .pipe(
      z.nativeEnum(Domain, {
        errorMap: () => ({ message: "Category is required" }),
      })
    ),
  estimatedSolveTime: z.coerce
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

  const { data: hash, writeContract, isPending } = useWriteContract();

  const form = useForm<ModeratorReviewValues>({
    resolver: zodResolver(reviewChallengeSchema),
    defaultValues: {
      relevance: undefined,
      correctness: undefined,
      completeness: undefined,
      clarity: undefined,
      originality: undefined,
      absenceBias: undefined,
      noPlagiarism: undefined,
      difficulty: undefined,
      category: undefined,
      estimatedSolveTime: 1,
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

  async function onSubmit(data: ModeratorReviewValues) {
    setIsSubmitDisabled(true);

    try {
      await updateModeratorReview(challenge_id, address as `0x${string}`, data);
      console.log("Data:", data);
      toast.success("Upload data: " + data);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
    setIsSubmitDisabled(false);
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading challenge data...</div>;
  }

  const createdOnDate = challenge?.contributeAt
    ? epochToDateString(challenge.contributeAt)
    : "N/A";

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mt-3.5">
            <CardTitle className="text-2xl">{challenge?.title}</CardTitle>
            <Badge
              className={cn(
                "font-normal capitalize",
                statusStyles[challenge?.status as keyof typeof statusStyles]
              )}
            >
              {
                ChallengeStatusLabels[
                  challenge?.status as keyof typeof ChallengeStatusLabels
                ]
              }
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Category
              </span>
              <Badge variant="outline" className="w-fit">
                {DomainLabels[challenge?.category as Domain]}
              </Badge>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Contribution fee
              </span>
              <span>0 ETHs</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Created On
              </span>
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>{createdOnDate}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Expected verification date
              </span>
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>Feb 31, 2077</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Participants
              </span>
              <div className="flex items-center">
                <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>0 enrolled</span>
              </div>
            </div>
          </div>

          {challenge?.description && (
            <>
              <Separator />
              <div className="py-4">
                <h3 className="font-medium mb-2">Challenge Details</h3>
                <div
                  className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: challenge.description }}
                ></div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
              name="difficulty"
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={""}>
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
              name="estimatedSolveTime"
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
              disabled={isSubmitDisabled}
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
  );
}
