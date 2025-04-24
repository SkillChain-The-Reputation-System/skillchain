'use client';

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
  FormMessage
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Import utils
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

// Import contracts config
import { ContractConfig_ChallengeManager } from "@/constants/contracts-config";
import { fetchStringDataOffChain } from "@/lib/fetching-offchain-data-utils";
import axios from "axios";
import { IrysUploadResponseInterface } from "@/lib/interfaces";

// Schema for the review form
const reviewChallengeSchema = z.object({
  decision: z.enum(["approve", "reject"], {
    required_error: "You need to make a decision",
  }),
  reason: z.string()
    .min(1, "Reason is required")
    .max(1000, "Reason must be less than 1000 characters"),
});

export type ReviewFormValues = z.infer<typeof reviewChallengeSchema>;

interface ReviewChallengeFormProps {
  challengeId: string;
  titleUrl: string;
  descriptionUrl: string;
  category: string;
  submissionDate: string;
}

export function ReviewChallengeForm({
  challengeId,
  titleUrl,
  descriptionUrl,
  category,
  submissionDate
}: ReviewChallengeFormProps) {
  const { address } = useAccount();
  const router = useRouter();
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState<string>('Loading...');
  const [challengeDescription, setChallengeDescription] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(true);

  const { data: hash, writeContract, isPending } = useWriteContract();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewChallengeSchema),
    defaultValues: {
      decision: undefined,
      reason: "",
    },
  });

  // Fetch challenge content
  useEffect(() => {
    async function fetchChallengeData() {
      setIsLoading(true);
      try {
        const [title, description] = await Promise.all([
          fetchStringDataOffChain(titleUrl),
          fetchStringDataOffChain(descriptionUrl)
        ]);
        
        setChallengeTitle(title || "No title available");
        setChallengeDescription(description || "No description available");
      } catch (error) {
        console.error("Error fetching challenge data:", error);
        toast.error("Failed to load challenge data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchChallengeData();
  }, [titleUrl, descriptionUrl]);

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

  // Format category for display
  const formatCategory = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  async function onSubmit(data: ReviewFormValues) {
    setIsSubmitDisabled(true);
    
    try {
      // Upload review reason to Irys
      const { data: reasonUploadData } = await axios.post<IrysUploadResponseInterface>(
        "/api/irys/upload/upload-string",
        data.reason
      );

      console.log("Uploaded reason data: ", reasonUploadData);

    //   // Call smart contract to update challenge status
    //   writeContract({
    //     address: ContractConfig_ChallengeManager.address as `0x${string}`,
    //     abi: ContractConfig_ChallengeManager.abi,
    //     functionName: "moderateChallenge",
    //     args: [
    //       challengeId, 
    //       data.decision === "approve", 
    //       reasonUploadData.url
    //     ],
    //   });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
      setIsSubmitDisabled(false);
    }
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading challenge data...</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{challengeTitle}</CardTitle>
              <CardDescription>Challenge ID: {challengeId}</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {formatCategory(category)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium leading-none mb-2">Submission Date</h3>
            <p className="text-sm text-muted-foreground">{formatDate(submissionDate)}</p>
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <h3 className="text-sm font-medium leading-none mb-2">Description</h3>
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
              {challengeDescription}
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="decision"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Review Decision</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="approve" id="approve" />
                      <Label htmlFor="approve">Approve this challenge</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reject" id="reject" />
                      <Label htmlFor="reject">Reject this challenge</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please provide a reason for your decision..."
                    className="resize-none min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Explain why you are approving or rejecting this challenge.
                  This feedback will be visible to the contributor.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
