'use client';

import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
    errorMap: () => ({ message: "Category is required" }),
  }),

  owner: z.string(),
  date: z.string()
})

export type ChallengeFormValues = z.infer<typeof contributeChallengeSchema>;

export default function ContributeChallengeForm() {
  const { address } = useAccount();

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

  async function onSubmit(data: ChallengeFormValues) {
    alert(JSON.stringify(data, null, 2));
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
            </FormItem>
          )}
        />

        <Button type="submit">
          Contribute
        </Button>
      </form>
    </Form>
  )
}