'use client'

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { usePathname, useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner"

import {
  Briefcase,
  CalendarDays,
  Clock,
  Eye,
  Info,
  Loader,
  MoreHorizontal,
  PenLine,
  User,
  X
} from "lucide-react";

import { pageUrlMapping } from "@/constants/navigation";
import { meetingStatusStyles } from "@/constants/styles";
import { JobDuration, JobDurationLabels, MeetingStatus, MeetingStatusLabels } from "@/constants/system";
import { fetchMeetingsByRecruiter } from "@/lib/fetching-onchain-data-utils";
import { cancelMeeting } from "@/lib/write-onchain-utils";
import { BriefMeetingInterface } from "@/lib/interfaces";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function MeetingsDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [meetingList, setMeetingList] = useState<BriefMeetingInterface[]>([]);
  const { address } = useAccount();
  const pathname = usePathname();

  const renderMeetingStatus = (date: Date, fromTime: string, toTime: string) => {
    const now = new Date();

    function parseTimeToDate(date: Date, timeString: string): Date {
      const [hours, minutes] = timeString.split(':').map(Number);
      const result = new Date(date);
      result.setHours(hours, minutes, 0, 0);
      return result;
    }

    const fromDateTime = parseTimeToDate(date, fromTime);
    const toDateTime = parseTimeToDate(date, toTime);

    let targetTime: Date;
    let isUpcoming: boolean;

    if (now < fromDateTime) {
      // Event hasn't started yet
      targetTime = fromDateTime;
      isUpcoming = true;
    } else if (now <= toDateTime) {
      // Event is currently happening
      return "Happening now";
    } else {
      // Event has ended
      targetTime = toDateTime;
      isUpcoming = false;
    }

    const diffMs = Math.abs(targetTime.getTime() - now.getTime());

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 1) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${isUpcoming ? 'remaining' : 'ago'}`;
    } else if (diffHours >= 1) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${isUpcoming ? 'remaining' : 'ago'}`;
    } else if (diffMinutes >= 1) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ${isUpcoming ? 'remaining' : 'ago'}`;
    } else {
      // Less than or equal to 1 minute
      return isUpcoming ? 'Starting soon' : 'Just ended';
    }
  }

  const handleViewMeeting = (roomId: string) => {
    router.push(pageUrlMapping.recruiter_meetings + `/${roomId}`)
  }

  const handleRescheduleMeeting = (meeting_id: string) => {
    router.push(pathname + `/${meeting_id}/reschedule`);
  }

  const handleCancelMeeting = async (meeting_id: string) => {
    if (!address) {
      return;
    }

    try {
      await cancelMeeting(address, meeting_id);

      setMeetingList(meetingList.map(meeting => {
        if (meeting.id === meeting_id) {
          return { ...meeting, status: MeetingStatus.CANCELLED }
        } else {
          return meeting
        }
      }))
      toast.info("You've cancelled this meeting");
    } catch (error) {
      console.log("Error occurs: ", error)
      toast.error("Error occurs. Please try again")
    } finally {

    }
  }

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!address) {
        return;
      }

      try {
        setIsLoading(true);
        const fetchedMeetings = await fetchMeetingsByRecruiter(address);
        setMeetingList(fetchedMeetings);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        // toast.error("Failed to fetch jobs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeeting();
  }, [address])

  return (
    <div className="min-h-screen mt-4">
      <Toaster position="top-right" richColors />

      <div className="flex gap-2">
        <Input
          placeholder="Search meetings..."
        />
      </div>

      <div className="mt-5 border border-gray-300 dark:border-input rounded-md shadow-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="xl:w-xs font-bold p-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Applicant
                </div>
              </TableHead>
              <TableHead className="xl:w-2xs font-bold p-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Position
                </div>
              </TableHead>
              <TableHead className="font-bold p-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Meeting Date
                </div>
              </TableHead>
              <TableHead className="font-bold p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Until event
                </div>
              </TableHead>
              <TableHead className="font-bold p-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Status
                </div>
              </TableHead>
              <TableHead className="font-bold p-3">
                {/* Action column */}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="place-items-center p-7">
                  <Loader className="h-8 w-8 animate-spin" />
                </TableCell>
              </TableRow>
            ) : (
              meetingList.length > 0 ? (
                meetingList.map((meeting) => (
                  <TableRow key={meeting.id} className="hover:bg-accent/80 border-gray-300 dark:border-input">
                    <TableCell className="p-3">{meeting.applicant.fullname ? meeting.applicant.fullname : meeting.applicant.address}</TableCell>
                    <TableCell className="p-3">
                      <div className="flex flex-col gap-1">
                        {meeting.position}
                        <div className="text-muted-foreground text-xs">
                          {JobDurationLabels[meeting.duration as JobDuration]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-3">
                      <div className="flex flex-col gap-1">
                        {format(meeting.date, "PPP")}
                        <div className="text-muted-foreground text-xs">
                          {meeting.fromTime} - {meeting.toTime}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-3">{renderMeetingStatus(meeting.date, meeting.fromTime, meeting.toTime)}</TableCell>
                    <TableCell className="p-3">
                      <Badge className={cn(meetingStatusStyles[meeting.status as MeetingStatus])}>
                        {MeetingStatusLabels[meeting.status as MeetingStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="cursor-pointer"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel className="font-bold">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleViewMeeting(meeting.id)}
                          >
                            <Eye />
                            View meeting
                          </DropdownMenuItem>

                          {meeting.status == MeetingStatus.PENDING && (
                            <>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleRescheduleMeeting(meeting.id)}
                              >
                                <PenLine />
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleCancelMeeting(meeting.id)}
                              >
                                <X className="stroke-red-600 dark:stroke-red-400" />
                                <span className="text-red-600 dark:text-red-400">Cancel</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="p-7 text-center">
                    No results
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}