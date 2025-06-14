"use client";

// Import hooks
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

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
import { getChallengeById } from "@/lib/fetching-onchain-data-utils";
import { getErrorMessage } from "@/lib/error-utils";
import { saveChallengeDraft } from "@/lib/write-onchain-utils";

// Set up challenge schema input
const editChallengeSchema = z.object({
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

interface EditChallengeForm {
  id: `0x${string}`;
}

export type editChallengeFormValues = z.infer<typeof editChallengeSchema>;

export function EditChallengeForm({ id }: EditChallengeForm) {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<editChallengeFormValues>({
    resolver: zodResolver(editChallengeSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      bounty: 0.01,
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!address) {
        return;
      }

      try {
        setIsLoading(true);
        const fetchedChallenge = await getChallengeById(id);
        form.reset({
          title: fetchedChallenge?.title,
          category: fetchedChallenge?.category,
          description: fetchedChallenge?.description,
          bounty: fetchedChallenge?.bounty,
        });
      } catch (error: any) {
        console.log(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isConnected]);

  const onSave = () => {
    form.handleSubmit(async (data: editChallengeFormValues) => {
      if(!address) {
        return;
      }

      try {
        setSaving(true);

        const success = await saveChallengeDraft(id, data);

        if(success) {
          toast.info("Saved changes")
        }
      } catch(error: any) {
        toast.error(getErrorMessage(error))
      } finally {
        setSaving(false);
      }
    })()
  }

  return (
    <div>
      <Toaster position="top-right" richColors />

      {isLoading ? (
        <>Loading...</>
      ) : (
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
                        value={Number(field.value).toString()}
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
                size="lg"
                className="cursor-pointer text-base bg-blue-600 hover:bg-blue-600/80 text-white"
                disabled={saving}
                onClick={onSave}
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
