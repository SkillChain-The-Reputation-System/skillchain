"use client";

// Import hooks
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { useState } from "react";

// Import lucide-react icons
import { Send } from "lucide-react"

// Import UI components
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import RichTextEditor from "@/components/rich-text-editor";
import ButtonWithAlert from "@/components/button-with-alert";

// Import utils
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DomainLabels, Domain } from "@/constants/system";
import { contributeChallenge, waitForTransaction } from "@/lib/write-onchain-utils"

// Set up challenge schema input
const contributeChallengeSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(18, "Description must be at least 10 characters")
    .max(10000, "Description must be less than 4000 characters"),
  category: z
    .coerce
    .number({ invalid_type_error: "Category is required" })
    .pipe(z.nativeEnum(Domain)),
});

export type ChallengeFormValues = z.infer<typeof contributeChallengeSchema>;

export function ContributeChallengeForm() {
  const { address } = useAccount(); // get user's current address
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false); // for enable/disable submit button

  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(contributeChallengeSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined
    },
  });

  function onSubmit() {
    form.handleSubmit(async (data: ChallengeFormValues) => {
      if (!address) {
        return;
      }

      try {
        setIsSubmitDisabled(true);
        const txHash = await contributeChallenge(address, data);
        await waitForTransaction(txHash);
        toast.success("You have successfully contribute this challenge");
        window.location.reload();
      } catch (error: any) {
        toast.error("Error occurs. Please try again!");
      } finally {
        setIsSubmitDisabled(false);
      }
    })();
  }

  return (
    <div className="w-full max-w-5xl self-center">
      <Toaster position="top-right" richColors />

      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-bold">Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter challenge title"
                    className="border-black dark:border-white border-1 h-10 !text-[15px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-bold">Description</FormLabel>
                <FormControl>
                  <RichTextEditor
                    {...field}
                    className="w-full max-w-5xl min-h-[250px] border-black dark:border-white border-1 rounded-md bg-slate-50 py-2 px-3 dark:bg-blue-950/15"
                    placeholder="Challenge is about what and its goal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-bold">Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={""}>
                  <FormControl>
                    <SelectTrigger className="w-[300px] cursor-pointer border-black dark:border-white border-1 text-[15px]">
                      <SelectValue placeholder="Select category of your challenge" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-[300px] border-black dark:border-white border-1 text-[15px]">
                    {
                      // get the numeric enum members
                      (Object.values(Domain) as unknown as number[])
                        .filter((v) => typeof v === "number")
                        .map((num) => (
                          <SelectItem key={num} value={num.toString()} className="cursor-pointer">
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
        </form>
      </Form>

      <ButtonWithAlert
        size="lg"
        className="mt-8 bg-zinc-700 hover:bg-zinc-700/60 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/60"
        disabled={isSubmitDisabled}
        dialogTitle="Confirm challenge contribution"
        dialogDescription="This action cannot be undone, and you won't be able to make any edits afterward."
        continueAction={onSubmit}
      >
        <Send className="h-4 w-4" />
        Contribute
      </ButtonWithAlert>
    </div>
  );
}
