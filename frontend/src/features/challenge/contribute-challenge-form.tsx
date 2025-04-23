'use client';

// Import hooks
import { useForm } from "react-hook-form";
import { useAccount, useWriteContract } from "wagmi";
// import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Import external UI components
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormMessage,
  FormItem
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Import utils
import { redirect } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IrysUploadResponseInterface } from "@/lib/interfaces";
import axios from "axios";
import { toast } from "react-toastify";

// Import contracts config
import { ContractConfig_ChallengeManager } from "@/constants/contracts-config";

const contributeChallengeSchema = z.object({
  title: z.string().
    min(1, "Title is required").
    max(100, "Title must be less than 100 characters"),
  description: z.string().
    min(1, "Description is required").
    max(2000, "Description must be less than 2000 characters"),
  category: z.enum([
    "algorithms",
    "software-development",
    "system-design",
    "cybersecurity",
    "devops",
    "data-engineering",
    "soft-skills",
  ], {
    errorMap: () => ({ message: "Category is required" })
  }),
  owner: z.string(),
  date: z.string()
})

export type ChallengeFormValues = z.infer<typeof contributeChallengeSchema>;

export function ContributeChallengeForm() {
  const { address } = useAccount();
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false)
  const { data: hash, writeContract, isPending } = useWriteContract()
  // const router = useRouter();

  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(contributeChallengeSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      owner: address,
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    setIsSubmitDisabled(isPending);
    if (isPending) {
      toast.info("Transaction is pending. Please wait...");
    }
    if (!isPending && hash) {
      toast.success("Contributed successfully!");

      redirect("/dashboard/challenge/contribute");
    }
  }, [isPending]);

  async function onSubmit(data: ChallengeFormValues) {
    setIsSubmitDisabled(true);

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

    writeContract({
      address: ContractConfig_ChallengeManager.address as `0x${string}`,
      abi: ContractConfig_ChallengeManager.abi,
      functionName: "contributeChallenge",
      args: [title_upload_res_data.url, description_upload_res_data.url, data.category, data.date],
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <Textarea placeholder="Challenge is about what and its goal" {...field} />
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
                  <SelectItem value="algorithms">Algorithms</SelectItem>
                  <SelectItem value="software-development">Software Development</SelectItem>
                  <SelectItem value="system-design">System Design</SelectItem>
                  <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="data-engineering">Data Engineering</SelectItem>
                  <SelectItem value="soft-skills">Soft Skills</SelectItem>
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