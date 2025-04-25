'use client';

// Import hooks
import { useForm } from "react-hook-form";
import { useAccount, useWriteContract } from "wagmi";
import { useEffect, useState } from "react";

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
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/rich-text-editor";

// Import utils
import { redirect } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IrysUploadResponseInterface } from "@/lib/interfaces";
import axios from "axios";
import { toast } from "react-toastify";
import { ChallengeCategory, ChallengeCategoryLabels } from "@/lib/interfaces";

// Import contracts config
import { ContractConfig_ChallengeManager } from "@/constants/contracts-config";

// Set up challenge schema input
const contributeChallengeSchema = z.object({
  title: z.string().
    min(10, "Title must be at least 10 characters").
    max(100, "Title must be less than 100 characters"),
  description: z.string().
    min(18, "Description must be at least 10 characters").
    max(4000, "Description must be less than 2000 characters"),
  category: z.nativeEnum(ChallengeCategory, {
    errorMap: () => ({ message: "Category is required" })
  }),
  owner: z.string()
})

export type ChallengeFormValues = z.infer<typeof contributeChallengeSchema>;

export function ContributeChallengeForm() {
  const { address } = useAccount(); // get user's current address
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false) // for enable/disable submit button
  const { data: hash, writeContract, isPending } = useWriteContract() // for writing contract

  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(contributeChallengeSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      owner: address,
    },
  });

  useEffect(() => {
    setIsSubmitDisabled(isPending);
    if (isPending) {
      toast.info("Transaction is pending. Please wait...");
    }
    if (!isPending && hash) {
      toast.success("Contributed successfully!");

      redirect("/dashboard/contribution/contribute");
    }
  }, [isPending]);

  async function onSubmit(data: ChallengeFormValues) {
    setIsSubmitDisabled(true);

    // Upload title and description to Irys and get their URLs
    const [{ data: title_upload_res_data }, { data: description_upload_res_data }] = await Promise.all([
      axios.post<IrysUploadResponseInterface>(
        "/api/irys/upload/upload-string",
        data.title
      ),
      axios.post<IrysUploadResponseInterface>(
        "/api/irys/upload/upload-string",
        data.description
      )
    ]);

    // Write contract
    writeContract({
      address: ContractConfig_ChallengeManager.address as `0x${string}`,
      abi: ContractConfig_ChallengeManager.abi,
      functionName: "contributeChallenge",
      args: [title_upload_res_data.url, description_upload_res_data.url, Number(data.category), Date.now()],
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-5xl self-center">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter challenge title" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Challenge is about what and its goal" />
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
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select category of your challenge" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="w-[300px]">
                  {Object.entries(ChallengeCategory).map(([value, label]) => (
                    <SelectItem key={value} value={label}>
                      {ChallengeCategoryLabels[label as ChallengeCategory]}
                    </SelectItem>
                  ))}
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
  )
}