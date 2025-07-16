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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import RichTextEditor from "@/components/rich-text-editor";

// Import utils
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DomainLabels, Domain } from "@/constants/system";
import { createChallenge } from "@/lib/write-onchain-utils";
import { getErrorMessage } from "@/lib/error-utils";

// Set up challenge schema input
const createChallengeSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must be less than 100 characters"),
  category: z.coerce
    .number({ invalid_type_error: "Domain is required" })
    .pipe(z.nativeEnum(Domain)),
  description: z.string().optional(),
  bounty: z.coerce.number().gt(0, "Bounty should be greater than 0"),
});

export type draftChallengeFormValues = z.infer<typeof createChallengeSchema>;

export function CreateChallengeForm() {
  const form = useForm<draftChallengeFormValues>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      bounty: 0.01,
    },
    mode: "onChange",
  });

  const [resetKey, setResetKey] = useState(0); // Re-render components
  const { address } = useAccount(); // User's current address

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = () => {
    form.handleSubmit(async (data: draftChallengeFormValues) => {
      if (!address) {
        return;
      }

      try {
        setSubmitting(true);
        const success = await createChallenge(address, data);
        if (success) {
          toast.success("Created this challenge");
          // reset form and re-render
          form.reset();
          setResetKey((prev) => prev + 1);
        }
      } catch (error: any) {
        toast.error(getErrorMessage(error));
      } finally {
        setSubmitting(false);
      }
    })();
  };

  return (
    <div>
      <Toaster position="top-right" richColors />

      <Card className="max-w-6xl mx-auto">
        <CardContent>
          <Form {...form}>
            <form className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Title *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter challenge title" />
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
                    <FormLabel className="text-base">Domain *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={""}
                      key={resetKey}
                    >
                      <FormControl>
                        <SelectTrigger className="w-[300px] cursor-pointer">
                          <SelectValue placeholder="Select domain of your challenge" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-[300px]">
                        {
                          // get the numeric enum members
                          (Object.values(Domain) as unknown as number[])
                            .filter((v) => typeof v === "number")
                            .map((num) => (
                              <SelectItem
                                key={num}
                                value={num.toString()}
                                className="cursor-pointer"
                              >
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

              <FormField
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-base">Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        {...field}
                        error={fieldState.invalid}
                        placeholder="Challenge is about what and its goal"
                        className="min-h-[250px] max-w-[1103px]"
                        key={resetKey}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bounty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Bounty Amount (ETH) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min={0}
                        {...field}
                        className="w-[300px]"
                        placeholder="Enter bounty for moderation"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="flex justify-end mt-15">
            <Button
              disabled={submitting}
              onClick={onSubmit}
            >
              {submitting ? "Creating..." : "Create challenge"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
