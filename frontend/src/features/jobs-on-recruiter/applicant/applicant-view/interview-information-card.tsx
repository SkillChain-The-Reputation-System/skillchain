"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VideoIcon, CalendarCheck, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { JobApplicationStatus, MeetingStatusLabels } from "@/constants/system";
import { BriefMeetingInterface } from "@/lib/interfaces";
import { useRouter } from "next/navigation";
import { pageUrlMapping } from "@/constants/navigation";
import { fetchBriefMeetingByApplicationId } from "@/lib/fetching-onchain-data-utils";
import { meetingStatusStyles } from "@/constants/styles";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InterviewInformationCardProps {
  applicationStatus: JobApplicationStatus;
  applicationId: string;
}

export default function InterviewInformationCard({
  applicationStatus,
  applicationId,
}: InterviewInformationCardProps) {
  const router = useRouter();
  const [meetingData, setMeetingData] = useState<BriefMeetingInterface | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Fetch meeting data when application status is SHORTLISTED
  useEffect(() => {
    const fetchMeetingData = async () => {
      if (
        applicationStatus === JobApplicationStatus.SHORTLISTED &&
        applicationId
      ) {
        try {
          setLoading(true);
          console.log("Fetching meeting data for application:", applicationId);
          const meeting = await fetchBriefMeetingByApplicationId(applicationId);
          console.log("Meeting data:", meeting);
          setMeetingData(meeting);
        } catch (error) {
          console.error("Error fetching meeting data:", error);
          setMeetingData(null);
        } finally {
          setLoading(false);
        }
      } else {
        setMeetingData(null);
        setLoading(false);
      }
    };

    fetchMeetingData();
  }, [applicationStatus, applicationId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Information</CardTitle>
        <CardDescription>Schedule and meeting details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {applicationStatus === JobApplicationStatus.SHORTLISTED ? (
          <>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">
                  Loading interview information...
                </p>
              </div>
            ) : meetingData ? (
              <>
                {/* Interview Details */}
                <div className="space-y-6">
                  {/* Meeting Status */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Meeting Status
                    </h4>
                    <Badge
                      className={cn(
                        meetingStatusStyles[meetingData.status],
                        "select-none"
                      )}
                    >
                      {MeetingStatusLabels[meetingData.status]}
                    </Badge>
                  </div>

                  {/* Meeting Schedule */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                      Schedule
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Date
                        </p>
                        <p className="font-medium text-sm">
                          {format(
                            new Date(meetingData.meetingDate.date),
                            "PPP"
                          )}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Time
                        </p>
                        <p className="font-medium flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {meetingData.meetingDate.fromTime} -{" "}
                          {meetingData.meetingDate.toTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
                {/* Interview Management Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Interview Management
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      href={`/recruiter/meetings/${meetingData.id}/reschedule`}
                    >
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                      >
                        <CalendarCheck className="mr-2 h-4 w-4" /> Reschedule
                      </Button>
                    </Link>
                    <Link href={`/recruiter/meetings/${meetingData.id}`}>
                      <Button className="w-full cursor-pointer">
                        <VideoIcon className="mr-2 h-4 w-4" /> Meeting Room
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CalendarCheck className="h-10 w-10 mx-auto mb-4 opacity-50" />
                <p>
                  No interview has been scheduled yet. Click below to schedule
                  an interview.
                </p>
                <Link href={pageUrlMapping.recruiter_schedule}>
                  <Button className="mt-4">Schedule Interview</Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <VideoIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              Interview information will appear here once the application moves
              to shortlisted stage.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
