"use client";

import { useMemo } from 'react';
import { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { quality_factors_questions } from "@/constants/data";
import { ModeratorReviewValues } from "./review-challenge-form";
import { ChallengeDifficultyLevel, QualityFactorAnswer } from "@/constants/system";

interface ReviewFormSectionProps {
  form: UseFormReturn<ModeratorReviewValues>;
  isSubmitted: boolean;
  isSavingDraft: boolean;
  isSubmitDisabled: boolean;
  isChallengeFinalized: boolean;
  onSaveDraft: () => Promise<void>;
  onSubmit: (data: ModeratorReviewValues) => Promise<void>;
}

export function ReviewFormSection({
  form,
  isSubmitted,
  isSavingDraft,
  isSubmitDisabled,
  isChallengeFinalized,
  onSaveDraft,
  onSubmit
}: ReviewFormSectionProps) {
  // Quality factors memo
  const qualityFactorsSection = useMemo(() => (
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
                    onValueChange={(val) => val && field.onChange(val)}
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
  ), [form.control, isSubmitted]);

  // Suggestions section memo
  const suggestionsSection = useMemo(() => (
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
                    onValueChange={(val) => val && field.onChange(val)}
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
  ), [form.control, isSubmitted]);

  // Buttons section memo
  const buttonsSection = useMemo(() => (
    !isSubmitted ? (
      <div className="grid md:flex justify-center items-center gap-2 m-5">
        <Button
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSavingDraft || isChallengeFinalized}
        >
          <Save className="h-4 w-4" />
          Save Draft
        </Button>

        <Button
          type="submit"
          disabled={isSubmitDisabled || isChallengeFinalized}
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
      </div>
    )
  ), [isSavingDraft, isChallengeFinalized, isSubmitDisabled, isSubmitted, onSaveDraft]);

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {qualityFactorsSection}
          {suggestionsSection}
          {buttonsSection}
        </form>
      </Form>
    </div>
  );
}

export default ReviewFormSection;
