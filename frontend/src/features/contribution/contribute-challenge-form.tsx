"use client";

// Import hooks
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { useState } from "react";

// Import lucide-react icons
import { Send, LoaderCircle } from "lucide-react"

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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    .min(17, "Description must be at least 10 characters")
    .max(10000, "Description must be less than 4000 characters"),
  category: z
    .coerce
    .number({ invalid_type_error: "Domain is required" })
    .pipe(z.nativeEnum(Domain)),
});

export type ChallengeFormValues = z.infer<typeof contributeChallengeSchema>;

export function ContributeChallengeForm() {
  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(contributeChallengeSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined
    },
    mode: "onChange",
  });

  const [resetKey, setResetKey] = useState(0); // Re-render components
  const { address } = useAccount(); // User's current address

  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function onSubmit() {
    form.handleSubmit(async (data: ChallengeFormValues) => {
      if (!address) {
        return;
      }

      try {
        setSubmitting(true);
        const txHash = await contributeChallenge(address, data);
        await waitForTransaction(txHash);
        toast.success("You have successfully contributed this challenge");
        // reset form and re-render
        setIsDialogOpen(false);
        form.reset()
        setResetKey(prev => prev + 1);
      } catch (error: any) {
        toast.error("Error occurs. Please try again!");
      } finally {
        setSubmitting(false);
      }
    })();
  }

  return (
    <div className="w-full max-w-5xl self-center">
      <Toaster position="top-right" richColors />

      <AlertDialog open={isDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">Confirm challenge contribution</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone, and you won't be able to make any edits afterward.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => setIsDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              className="cursor-pointer bg-zinc-700 hover:bg-zinc-700/80 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/80"
              onClick={onSubmit}
              disabled={submitting}
            >
              {
                submitting ? (
                  <div className="flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : ("Confirm")
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Provide challenge information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Challenge Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter challenge title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-base">Challenge Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        {...field}
                        error={fieldState.invalid}
                        placeholder="Challenge is about what and its goal"
                        className="max-w-5xl min-h-[250px]"
                        key={resetKey}
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
                    <FormLabel className="text-base">Domain</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={""} key={resetKey}>
                      <FormControl>
                        <SelectTrigger className="w-[300px] cursor-pointer">
                          <SelectValue placeholder="Select category of your challenge" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-[300px]">
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

          <Button
            size="lg"
            className="cursor-pointer mt-8 bg-zinc-700 hover:bg-zinc-700/60 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/60"
            onClick={
              () => form.trigger().then((isValid) => {
                if (isValid) {
                  setIsDialogOpen(true);
                }
              })
            }
          >
            <Send className="h-4 w-4" />
            Contribute
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
