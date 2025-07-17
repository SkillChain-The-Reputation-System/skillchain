'use client';

import { useAccount } from "wagmi";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";

import {
  CalendarIcon,
  CalendarPlus,
  Check,
  Clock,
  Loader,
  LoaderCircle,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";

import { format } from "date-fns"
import { cn } from "@/lib/utils";
import { timeSlots, calculateMeetingDuration } from "./time-utils";
import { JobApplicationStatus, JobStatus } from "@/constants/system";
import { JobPreviewInterface, BriefJobApplicationInterface } from "@/lib/interfaces";
import { fetchPreviewJobsByRecruiter, fetchBriefApplicationByJobID, fetchIsApplicationHasMeeting } from "@/lib/fetching-onchain-data-utils";
import { scheduleMeeting } from "@/lib/write-onchain-utils";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const formSchema = z.object({
  jobId: z.string().min(1, "A specific job is required"),
  application: z.string().min(1, "An applicant is required"), /// Notice: Select Item displays applicant but this field will get application ID 
  date: z.date({
    required_error: "Date of the meeting is required",
  }),
  fromTime: z.string().min(1, "Start time is required"),
  toTime: z.string().min(1, "End time is required"),
  note: z.string().optional()
})

export type ScheduleMeetingFormData = z.infer<typeof formSchema>;

export default function ScheduleMeetingForm() {
  // Loading states
  const [jobsLoading, setJobsLoading] = useState<boolean>(false);
  const [applicantsLoading, setApplicantsLoading] = useState<boolean>(false);
  const [scheduling, setScheduling] = useState<boolean>(false);
  const [stateLoading, setStateLoading] = useState<boolean>(false);
  // Data state for fetching
  const [jobs, setJobs] = useState<JobPreviewInterface[]>([]);
  const [applications, setApplications] = useState<BriefJobApplicationInterface[]>([]);
  const [isHasMeeting, setIsHasMeeting] = useState<boolean>(false);
  // Other
  const { address } = useAccount();

  const form = useForm<ScheduleMeetingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobId: "",
      application: "",
      fromTime: "",
      toTime: "",
    },
    mode: "onChange"
  })

  // Reactive form fields that trigger side effects
  const watchedJobID = form.watch("jobId")
  const watchedApplication = form.watch("application")
  const watchedFromTime = form.watch("fromTime")
  const watchedToTime = form.watch("toTime")

  function handleScheduleMeeting() {
    form.handleSubmit(async (data: ScheduleMeetingFormData) => {
      if (!address) {
        return;
      }

      try {
        setScheduling(true);
        await scheduleMeeting(address, data);

        toast.success("You've scheduled this meeting");
        form.reset()
      } catch (error) {
        toast.error("Error occurs. Please try again")
      } finally {
        setScheduling(false);
      }
    })()
  }

  useEffect(() => {
    const fetchJobs = async () => {
      if (address) {
        try {
          setJobsLoading(true);
          const fetchedJobs = await fetchPreviewJobsByRecruiter(address as `0x${string}`);

          const validJobs = fetchedJobs.filter(job => job.status !== JobStatus.DRAFT && job.status !== JobStatus.ARCHIVED)
          setJobs(validJobs);
        } catch (error) {
          console.error("Error fetching jobs:", error);
          toast.error("Failed to fetch jobs. Please try again.");
        } finally {
          setJobsLoading(false);
        }
      }
    };

    fetchJobs();
  }, [address]);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!watchedJobID) return;

      try {
        setApplicantsLoading(true);
        const fetchedApplications = await fetchBriefApplicationByJobID(watchedJobID);

        // this is correct code in the end
        const validApplications = fetchedApplications.filter((application) => application.status === JobApplicationStatus.SHORTLISTED)
        setApplications(validApplications);

        // setApplications(fetchedApplications); // uncomment for easy testing at Insight Page

        setIsHasMeeting(false);
        form.setValue("application", "")
      } catch (error) {
        console.error("Error fetching applicants:", error);
        toast.error("Failed to fetch applicants. Please try again.");
      } finally {
        setApplicantsLoading(false);
      }
    };

    fetchApplicants();
  }, [watchedJobID]);

  useEffect(() => {
    const fetchIsHasMeeting = async () => {
      if (!watchedApplication) return;

      try {
        setStateLoading(true);
        const fetchedState = await fetchIsApplicationHasMeeting(watchedApplication);
        setIsHasMeeting(fetchedState);
      } catch (error) {
        console.error("Error fetching applicants:", error);
        toast.error("Failed to fetch applicants. Please try again.");
      } finally {
        setStateLoading(false);
      }
    }

    fetchIsHasMeeting();
  }, [watchedApplication])

  useEffect(() => {
    if (watchedFromTime && watchedToTime) {
      if (calculateMeetingDuration(watchedFromTime, watchedToTime) <= 0) {
        form.setValue("toTime", "")
      }
    }
  }, [watchedFromTime])

  return (
    <div className="mx-auto max-w-3xl mt-5">
      <Toaster position="top-right" richColors />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            Schedule Interview Meeting
          </CardTitle>
          <CardDescription>Schedule a meeting with an applicant for a specific job position</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="jobId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Position</FormLabel>
                    <div className="flex items-center gap-2">
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="min-w-md cursor-pointer" disabled={jobsLoading}>
                            <SelectValue placeholder="Select a job position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {jobs.length > 0 ? (
                            jobs.map((job) => (
                              <SelectItem key={job.id} value={job.id} className="cursor-pointer">
                                {job.title}
                              </SelectItem>
                            ))
                          ) : (
                            <Label className="text-muted-foreground text-sm italic">No valid job positions found</Label>
                          )}
                        </SelectContent>
                      </Select>

                      {jobsLoading && (
                        <Loader className="max-h-5 max-w-5 animate-spin" />
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedJobID && (
                <FormField
                  control={form.control}
                  name="application"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applicant</FormLabel>
                      <div className="flex items-center gap-2">
                        <Select value={field.value} onValueChange={field.onChange} disabled={applicantsLoading}>
                          <FormControl>
                            <SelectTrigger className="min-h-10 min-w-md cursor-pointer">
                              <SelectValue placeholder="Select an applicant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {applications.length > 0 ? (
                              applications.map((application) => (
                                <SelectItem key={application.id} value={application.id} className="cursor-pointer">
                                  <Avatar>
                                    <AvatarImage
                                      src={application.profile_data.avatar_url || ""}
                                      alt={application.profile_data.address || "Applicant"}
                                    />
                                    <AvatarFallback>
                                      {application.profile_data.fullname
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase() || "AP"}
                                    </AvatarFallback>
                                  </Avatar>
                                  {application.profile_data.fullname || application.profile_data.address}
                                </SelectItem>
                              ))
                            ) : (
                              <Label className="text-muted-foreground text-sm italic">No applicants found</Label>
                            )}
                          </SelectContent>
                        </Select>

                        {applicantsLoading && (
                          <Loader className="max-h-5 max-w-5 animate-spin" />
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchedApplication && (
                stateLoading ? (
                  <div className="p-2 w-md flex items-center gap-2 bg-gray-200 rounded-md">
                    <Loader className="animate-spin h-4 w-4 stroke-gray-700" />
                    <div className="text-sm text-gray-700">
                      Checking if you've already scheduled a meeting for this applicant...
                    </div>
                  </div>
                ) : (
                  isHasMeeting ? (
                    <div className="p-2 w-md flex items-center gap-2 bg-red-100 dark:bg-red-800 rounded-md">
                      <X className="h-4 w-4 stroke-red-700 dark:stroke-red-100" />
                      <div className="text-sm text-red-700 dark:text-red-100">
                        You've already scheduled a meeting for this applicant
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-2 w-md flex items-center gap-2 bg-green-100 dark:bg-green-800 rounded-md">
                        <Check className="h-4 w-4 stroke-green-700 dark:stroke-green-100" />
                        <div className="text-sm text-green-700 dark:text-green-100">
                          It's available to schedule this meeting
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meeting Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    data-empty={!field.value}
                                    className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2">
                        <FormField
                          control={form.control}
                          name="fromTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>From Time</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger className="w-[125px] cursor-pointer">
                                    <SelectValue placeholder="Start at" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-80">
                                  {timeSlots.map((time) => (
                                    <SelectItem key={time.value} value={time.value} className="cursor-pointer">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {time.value}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="toTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>To Time</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange} >
                                <FormControl>
                                  <SelectTrigger className="w-[125px] cursor-pointer">
                                    <SelectValue placeholder="End at" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-80">
                                  {timeSlots
                                    .filter((time) => !watchedFromTime || time.value > watchedFromTime)
                                    .map((time) => (
                                      <SelectItem key={time.value} value={time.value} className="cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          {time.value}
                                        </div>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {watchedFromTime && watchedToTime && (
                        <div className="rounded-md bg-blue-100 dark:bg-blue-950 p-3">
                          <p className="flex text-sm text-blue-800 dark:text-white items-center gap-2">
                            <Clock className="max-h-4 max-w-4" />
                            Meeting duration: {calculateMeetingDuration(watchedFromTime, watchedToTime)} minutes
                          </p>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Note for Applicant (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add any additional information or instructions for the applicant..."
                                className="resize-none min-h-40"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )
                )
              )}
            </form>
          </Form>

          <Button
            size="lg"
            className="cursor-pointer mt-10 bg-zinc-700 hover:bg-zinc-700/80 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/80"
            onClick={handleScheduleMeeting}
            disabled={scheduling || isHasMeeting}
          >
            {scheduling ? (
              <>
                <LoaderCircle className="max-h-4 max-w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <CalendarPlus className="max-h-4 max-w-4" />
                Schedule
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}