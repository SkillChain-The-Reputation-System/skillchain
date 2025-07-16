"use client";

import { buttonVariants } from "@/components/ui/button";
import { pageUrlMapping } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Domain, DomainLabels, JobDuration, JobDurationLabels } from "@/constants/system";
import { fetchJobById } from "@/lib/fetching-onchain-data-utils";
import { JobInterface } from "@/lib/interfaces";
import { useAccount } from "wagmi";
import { updateJobContent } from "@/lib/write-onchain-utils";

// Use domains from the system constants
const DOMAINS = Object.entries(Domain)
  .filter(([key]) => !isNaN(Number(key))) // Filter out reverse mappings
  .map(([enumValue, domainKey]) => ({
    id: enumValue,
    name: DomainLabels[Number(enumValue) as Domain],
  }));

// Form schema for validation
const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z
    .string()
    .min(20, { message: "Description must be at least 20 characters" }),
  requirements: z
    .string()
    .min(10, { message: "Requirements must be at least 10 characters" }),
  location: z.string().optional(),
  duration: z.number(),
  compensation: z.string(),
  domains: z
    .array(z.number())
    .min(1, { message: "Select at least one domain" }),
  domainReputations: z.record(z.string(), z.number().min(0)),
  requireGlobalReputation: z.boolean(),
  globalReputationScore: z.number().min(0).optional(),
  deadlineDate: z.date({
    required_error: "Application deadline date is required",
  }),
  deadlineTime: z.string().min(1, "Application deadline time is required"),
  deadline: z.number(), // Epoch time in milliseconds
});

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address } = useAccount();
  const jobId = params.id as string;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      location: "",
      duration: JobDuration.FULL_TIME,
      compensation: "",
      domains: [] as number[],
      domainReputations: {},
      requireGlobalReputation: false,
      globalReputationScore: 0,
      deadline: 0,
    },
  });

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        const jobData = await fetchJobById(jobId);
        
        if (jobData) {
          setJob(jobData);
          
          // Set form values from the fetched job data
          form.reset({
            title: jobData.title,
            description: jobData.description,
            requirements: jobData.requirements,
            location: jobData.location || "",
            duration: jobData.duration,
            compensation: jobData.compensation,
            domains: jobData.domains,
            domainReputations: jobData.domainReputations,
            requireGlobalReputation: jobData.requireGlobalReputation,
            globalReputationScore: jobData.requireGlobalReputation ? jobData.globalReputationScore || 0 : 0,
            deadline: jobData.deadline,
          });

          // Set selected domains
          const domainIds = jobData.domains.map(domain => domain.toString());
          setSelectedDomains(domainIds);
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast.error("Failed to fetch job details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobData();
    }
  }, [jobId, form]);

  // Handle domain selection
  const handleDomainChange = (domainId: string, checked: boolean) => {
    let updatedDomains = [...selectedDomains];

    if (checked) {
      updatedDomains.push(domainId);
      form.setValue(`domainReputations.${domainId}`, 0);
    } else {
      updatedDomains = updatedDomains.filter((id) => id !== domainId);
      const currentReputations = form.getValues("domainReputations");
      const { [domainId]: removed, ...rest } = currentReputations;
      form.setValue("domainReputations", rest);
    }

    setSelectedDomains(updatedDomains);
    // Convert string IDs to Domain enum values (numbers)
    const domainEnumValues = updatedDomains.map((id) => Number(id));
    form.setValue("domains", domainEnumValues);
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      console.log("Form values:", values);
      
      if (!job || !address) {
        toast.error("Missing job data or wallet connection.");
        return;
      }

      // Implement job update logic with blockchain interaction
      const tx = await updateJobContent(jobId, values);

      // Show success message
      toast.success("Job updated successfully!");

      // Redirect to job details page
      router.push(`/recruiter/jobs/${jobId}`);
    } catch (error: any) {
      if (error.shortMessage) {
        toast.error(error.shortMessage);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("There was an error updating your job. Please try again.");
      }
      console.error("Error updating job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-8">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-md" />
        <div className="h-96 bg-slate-200 animate-pulse rounded-md" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-slate-600 mb-6">
          The job you are trying to edit doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push(pageUrlMapping.recruiter_jobs)}>
          Go Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`${pageUrlMapping.recruiter_jobs}/${jobId}`}
        className={cn(buttonVariants(), "text-xs md:text-sm mb-4")}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Job Post
      </Link>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Job</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter job title" {...field} />
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
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter detailed job description"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter job requirements"
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Remote, Hybrid, or specific location"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={JobDuration.FULL_TIME.toString()}>{JobDurationLabels[JobDuration.FULL_TIME]}</SelectItem>
                          <SelectItem value={JobDuration.PART_TIME.toString()}>{JobDurationLabels[JobDuration.PART_TIME]}</SelectItem>
                          <SelectItem value={JobDuration.CONTRACT.toString()}>{JobDurationLabels[JobDuration.CONTRACT]}</SelectItem>
                          <SelectItem value={JobDuration.FREELANCE.toString()}>{JobDurationLabels[JobDuration.FREELANCE]}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="compensation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compensation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Compensation amount or range"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="date"
                          value={
                            field.value
                              ? new Date(field.value).toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              // Preserve existing time if any, or set to 00:00
                              const currentDate = field.value
                                ? new Date(field.value)
                                : new Date();
                              const newDate = new Date(e.target.value);
                              newDate.setHours(
                                currentDate.getHours(),
                                currentDate.getMinutes(),
                                0,
                                0
                              );
                              field.onChange(newDate.getTime()); // Store as epoch time in milliseconds
                            }
                          }}
                        />
                        <Input
                          type="time"
                          value={
                            field.value
                              ? `${String(
                                  new Date(field.value).getHours()
                                ).padStart(2, "0")}:${String(
                                  new Date(field.value).getMinutes()
                                ).padStart(2, "0")}`
                              : "00:00"
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              // Preserve existing date, update the time
                              const currentDate = field.value
                                ? new Date(field.value)
                                : new Date();
                              const [hours, minutes] = e.target.value
                                .split(":")
                                .map(Number);
                              currentDate.setHours(hours, minutes, 0, 0); // Set time but keep seconds and ms at 0
                              field.onChange(currentDate.getTime()); // Store as epoch time in milliseconds
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Specify both date and time for the deadline
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Skills Domains</FormLabel>
                <FormDescription>
                  Select at least one domain relevant to this job
                </FormDescription>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {DOMAINS.map((domain) => (
                    <div key={domain.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={domain.id}
                        checked={selectedDomains.includes(domain.id)}
                        onCheckedChange={(checked) =>
                          handleDomainChange(domain.id, checked === true)
                        }
                      />
                      <label
                        htmlFor={domain.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {domain.name}
                      </label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.domains && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.domains.message}
                  </p>
                )}
              </div>

              {selectedDomains.length > 0 && (
                <div className="space-y-3">
                  <FormLabel>Required Reputation Scores by Domain</FormLabel>
                  <div className="space-y-3">
                    {selectedDomains.map((domainId) => {
                      const domain = DOMAINS.find((d) => d.id === domainId);
                      return (
                        <div
                          key={domainId}
                          className="flex items-center space-x-2"
                        >
                          <FormField
                            control={form.control}
                            name={`domainReputations.${domainId}`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0 w-full">
                                <FormLabel className="w-40">
                                  {domain?.name}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onFocus={(e) => {
                                      if (e.target.value === "0") {
                                        e.target.value = "";
                                      }
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value === "") {
                                        e.target.value = "0";
                                        field.onChange(0);
                                      }
                                    }}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="requireGlobalReputation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Require Global Reputation Score</FormLabel>
                  </FormItem>
                )}
              />

              {form.watch("requireGlobalReputation") && (
                <FormField
                  control={form.control}
                  name="globalReputationScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Global Reputation Score</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onFocus={(e) => {
                            if (e.target.value === "0") {
                              e.target.value = "";
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value === "") {
                              e.target.value = "0";
                              field.onChange(0);
                            }
                          }}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the minimum global reputation score required
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating Job..." : "Update Job"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}