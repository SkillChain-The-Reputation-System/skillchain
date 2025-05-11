"use client";

// Import hooks
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { useState } from "react";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import RichTextEditor from "@/components/rich-text-editor";

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
  category: z.coerce.number().pipe(
    z.nativeEnum(Domain, {
      errorMap: () => ({ message: "Category is required" }),
    })
  ),
  owner: z.string(),
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
      category: undefined,
      owner: address,
    },
  });

  async function onSubmit(data: ChallengeFormValues) {
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
  }

  return (
    <Form {...form}>
      <Toaster position="top-right" richColors />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-4xl self-center space-y-8"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold">Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter challenge title" {...field} className="border-black dark:border-white border-1 h-10 !text-[15px]" />
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
                  value={field.value}
                  onChange={field.onChange}
                  className="min-h-[250px] border-black dark:border-white border-1 rounded-md bg-slate-50 py-2 px-3 dark:bg-blue-950/15 break-all"
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
                  <SelectTrigger className="w-[300px] border-black dark:border-white border-1 text-[15px]">
                    <SelectValue placeholder="Select category of your challenge" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="w-[300px] border-black dark:border-white border-1 text-[15px]">
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

        <Button type="submit" disabled={isSubmitDisabled}>
          Contribute
        </Button>
      </form>
    </Form>
  );
}
