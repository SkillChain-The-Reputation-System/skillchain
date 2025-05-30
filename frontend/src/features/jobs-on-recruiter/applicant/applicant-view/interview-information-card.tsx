"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  VideoIcon,
  Clock,
  Users,
  Settings,
  Trash2,
  CalendarCheck,
} from "lucide-react";
import { format } from "date-fns";
import { JobApplicationStatus } from "@/constants/system";
import { MockInterviewData } from "./types";
import { toast } from "react-toastify";

interface InterviewInformationCardProps {
  applicationStatus: JobApplicationStatus;
  mockInterviewData: MockInterviewData;
}

export default function InterviewInformationCard({
  applicationStatus,
  mockInterviewData,
}: InterviewInformationCardProps) {
  // Interview management functions with toast notifications
  const handleRescheduleMeeting = () => {
    toast.info("Interview rescheduled successfully!");
  };

  const handleCancelMeeting = () => {
    toast.error("Interview meeting cancelled!");
  };

  const handleSendInvitation = () => {
    toast.success("Interview invitation sent to candidate!");
  };

  const handleUpdateNotes = () => {
    toast.success("Interview notes updated!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Information</CardTitle>
        <CardDescription>Schedule and meeting details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {applicationStatus === JobApplicationStatus.INTERVIEWING ? (
          <>
            {/* Current Interview Status */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Status: Interview Scheduled
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                The interview has been scheduled. Use the management options
                below to update or modify the interview.
              </p>
            </div>

            {/* Interview Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Date & Time
                </h4>
                <p className="font-medium">
                  {format(mockInterviewData.scheduledDate, "PPP")} at{" "}
                  {format(mockInterviewData.scheduledDate, "p")}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Duration
                </h4>
                <p className="font-medium">
                  {mockInterviewData.duration} minutes
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Meeting Link
              </h4>
              <div className="flex items-center space-x-2 mt-1 overflow-hidden">
                <VideoIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <a
                  href={mockInterviewData.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
                >
                  {mockInterviewData.meetingLink}
                </a>
              </div>
            </div>

            {mockInterviewData.additionalNotes && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Additional Notes
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {mockInterviewData.additionalNotes}
                </p>
              </div>
            )}

            <Separator />

            {/* Interview Management Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Interview Management
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleSendInvitation}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <VideoIcon className="h-4 w-4" />
                  <span>Send Invitation</span>
                </Button>

                <Button
                  onClick={handleRescheduleMeeting}
                  variant="outline"
                  className="flex items-center space-x-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <Clock className="h-4 w-4" />
                  <span>Reschedule</span>
                </Button>

                <Button
                  onClick={handleUpdateNotes}
                  variant="outline"
                  className="flex items-center space-x-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Settings className="h-4 w-4" />
                  <span>Update Notes</span>
                </Button>

                <Button
                  onClick={handleCancelMeeting}
                  variant="destructive"
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Cancel Interview</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <VideoIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              Interview information will appear here once the application moves
              to interviewing stage.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
