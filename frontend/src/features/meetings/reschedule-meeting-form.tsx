'use client'

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
  ArrowLeftIcon,
  CalendarCog,
  CalendarIcon,
  Clock,
  Loader,
  LoaderCircle
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
import { Toaster, toast } from "sonner"

import { cn } from "@/lib/utils";
import { timeSlots, calculateMeetingDuration } from "./time-utils";
import { format } from "date-fns";
import { rescheduleMeeting } from "@/lib/write-onchain-utils";
import { fetchMeetingRoomById } from "@/lib/fetching-onchain-data-utils";
import { formSchema, ScheduleMeetingFormData } from "./schedule-meeting-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { MeetingRoomInterface } from "@/lib/interfaces";

interface RescheduleMeetingFormProps {
  meeting_id: string
}

export default function RescheduleMeetingForm({ meeting_id }: RescheduleMeetingFormProps) {
  const { address } = useAccount();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rescheduling, setRescheduling] = useState<boolean>(false);

  const [meeting, setMeeting] = useState<MeetingRoomInterface | null>(null);

  const form = useForm<ScheduleMeetingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobId: "",
      applicant: "",
      fromTime: "",
      toTime: "",
    },
    mode: "onChange"
  })

  const watchedFromTime = form.watch("fromTime")
  const watchedToTime = form.watch("toTime")

  const handleRescheduleMeeting = () => {
    form.handleSubmit(async (data: ScheduleMeetingFormData) => {
      if (!address) {
        return;
      }

      try {
        setRescheduling(true);
        await rescheduleMeeting(meeting_id, data);

        toast.success("You've rescheduled this meeting");
      } catch (error) {
        toast.error("Error occurs. Please try again")
      } finally {
        setRescheduling(false);
      }
    })()
  }

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        setIsLoading(true);

        const fetchedMeeting = await fetchMeetingRoomById(meeting_id);

        setMeeting(fetchedMeeting)
        if (fetchedMeeting) {
          form.reset({
            jobId: fetchedMeeting.job.id,
            applicant: fetchedMeeting.applicant.address,
            date: new Date(fetchedMeeting.date),
            fromTime: fetchedMeeting.fromTime,
            toTime: fetchedMeeting.toTime,
            note: fetchedMeeting.note
          })
        }
      } catch (error) {
        console.error("Error fetching meeting:", error);
        toast.error("Failed to fetch meeting. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeeting();
  }, [address])

  useEffect(() => {
    if (watchedFromTime && watchedToTime) {
      if (calculateMeetingDuration(watchedFromTime, watchedToTime) <= 0) {
        form.setValue("toTime", "")
      }
    }
  }, [watchedFromTime])

  return (
    <div>
      <Button
        onClick={() => router.back()}
        className="cursor-pointer"
      >
        <ArrowLeftIcon /> Go Back
      </Button>

      {isLoading ? (
        <div className="w-full h-120 flex flex-col gap-4 justify-center items-center">
          <Loader className="h-20 w-20 animate-spin duration-2500 text-muted-foreground" />
          <div>Loading meeting information...</div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl mt-5">
          <Toaster position="top-right" richColors />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                Reschedule Interview Meeting
              </CardTitle>
              <CardDescription>Reschedule this meeting for a time that works for you</CardDescription>
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
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="min-w-md cursor-pointer" disabled>
                              {meeting?.job.title}
                            </SelectTrigger>
                          </FormControl>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applicant</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled>
                          <FormControl>
                            <SelectTrigger className="min-h-10 min-w-md cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Avatar>
                                  <AvatarImage
                                    src={meeting?.applicant.avatar_url}
                                    alt={meeting?.applicant.address}
                                  />
                                </Avatar>

                                {meeting?.applicant.fullname ? meeting.applicant.fullname : meeting?.applicant.address}
                              </div>
                            </SelectTrigger>
                          </FormControl>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal border-gray-300 border cursor-pointer bg-white hover:bg-white dark:border-input  dark:bg-input/30",
                                  !field.value && "text-muted-foreground"
                                )}
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
                </form>
              </Form>

              <Button
                size="lg"
                className="cursor-pointer mt-10 bg-zinc-700 hover:bg-zinc-700/80 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/80"
                onClick={handleRescheduleMeeting}
                disabled={rescheduling}
              >
                {rescheduling ? (
                  <>
                    <LoaderCircle className="max-h-4 max-w-4 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  <>
                    <CalendarCog className="max-h-4 max-w-4" />
                    Reschedule
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}