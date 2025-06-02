'use client'
import {
  useState,
  useEffect,
  useRef
} from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner"

import { BriefMeetingInterface, JobApplicationInterface } from "@/lib/interfaces";
import { fetchBriefMeetingByApplicationId } from "@/lib/fetching-onchain-data-utils";
import { JobApplicationStatus, MeetingStatus, MeetingStatusLabels } from "@/constants/system";
import { format } from "date-fns";
import { renderMeetingUntilTime } from "@/features/meetings/time-utils";

import { JaaSMeeting } from "@jitsi/react-sdk"
import { CalendarX, LoaderCircle, Video, VideoOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { meetingStatusStyles } from "@/constants/styles";

const JAAS_API_KEY = process.env.JAAS_API_KEY as string

if (JAAS_API_KEY === undefined) {
  throw new Error(`${JAAS_API_KEY} environment variable is not defined.`);
}

interface ApplicationInterviewCardProps {
  application: JobApplicationInterface
}

export default function ApplicationInterviewCard({ application }: ApplicationInterviewCardProps) {
  const [meetingData, setMeetingData] = useState<BriefMeetingInterface | null>(null);
  const [loading, setLoading] = useState(false);

  const jitsiRef = useRef<HTMLDivElement>(null);
  const [isMeetingReady, setIsMeetingReady] = useState<boolean>(false);
  const [isInterviewing, setIsInterviewing] = useState<boolean>(false);

  useEffect(() => {
    const fetchMeetingData = async () => {
      if (
        application.status === JobApplicationStatus.SHORTLISTED &&
        application.id
      ) {
        try {
          setLoading(true);
          console.log("Fetching meeting data for application:", application.id);
          const meeting = await fetchBriefMeetingByApplicationId(application.id);
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
  }, [application]);

  const handleStartMeeting = () => {
    setIsInterviewing(true);
    setIsMeetingReady(false);
  }

  const handleStopMeeting = () => {
    setIsInterviewing(false);
    setIsMeetingReady(false);
  }

  useEffect(() => {
    if (isMeetingReady) {
      toast.info("Meeting room is ready");

      setTimeout(() => {
        jitsiRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      toast.warning("Meeting room is stopped");
    }
  }, [isMeetingReady])

  return (
    <div>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Interview Information</CardTitle>
            <CardDescription>Your meeting info scheduled by Recruiter</CardDescription>
          </div>
          {meetingData && (
            <Badge className={meetingStatusStyles[meetingData.status as MeetingStatus]}>
              {MeetingStatusLabels[meetingData.status as MeetingStatus]}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {application.status === JobApplicationStatus.SHORTLISTED ? (
            loading ? (
              <div className="grid grid-cols-1 p-5 place-items-center gap-4 bg-accent">
                <LoaderCircle className="h-10 w-10 animate-spin" />
                <div className="text-muted-foreground">Loading interview meeting...</div>
              </div>
            ) : (
              meetingData ? (
                <div>
                  <Toaster richColors position="top-right" />

                  <div className="flex flex-col">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2 bg-muted/30 p-3 rounded-lg">
                        <div className="text-muted-foreground text-sm">Date</div>
                        <div className="text-sm">{format(meetingData.meetingDate.date, "PPP")}</div>
                      </div>
                      <div className="flex flex-col gap-2 bg-muted/30 p-3 rounded-lg">
                        <div className="text-muted-foreground text-sm">Time</div>
                        <div className="text-sm">{meetingData.meetingDate.fromTime} - {meetingData.meetingDate.toTime}</div>
                      </div>
                    </div>
                    <div className="text-muted-foreground text-sm m-3">
                      Until event : {renderMeetingUntilTime(meetingData.meetingDate.date, meetingData.meetingDate.fromTime, meetingData.meetingDate.toTime)}
                    </div>

                    {meetingData.note && (
                      <div className="flex flex-col gap-2 bg-muted/30 p-3 rounded-lg my-3">
                        <div className="text-muted-foreground text-sm">Note from Recruiter</div>
                        <div className="text-sm">{meetingData.note}</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground text-sm m-3">
                        Room ID : {meetingData.roomId}
                      </div>

                      {meetingData.status === MeetingStatus.PENDING && (
                        isInterviewing ? (
                          <Button
                            variant="destructive"
                            onClick={handleStopMeeting}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <VideoOff className="h-5 w-5" />
                            Leave Meeting
                          </Button>
                        ) : (
                          <Button
                            onClick={handleStartMeeting}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Video className="h-5 w-5" />
                            Join Meeting
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 p-7 place-items-center gap-4">
                  <CalendarX className="h-10 w-10" />
                  <div className="text-muted-foreground">Your recruiter hasn't scheduled any meetings for you yet. Please check back later.</div>
                </div>
              )
            )
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                Interview information will appear here once you're shortlisted
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {meetingData && isInterviewing && (
        <div ref={jitsiRef}>
          <JaaSMeeting
            appId={JAAS_API_KEY}
            roomName={meetingData.roomId}
            configOverwrite={{
              startWithAudioMuted: true,
              disableModeratorIndicator: true,
              startScreenSharing: true,
              enableEmailInStats: false
            }}
            onApiReady={(externalApi) => {
              externalApi.addListener('videoConferenceLeft', () => {
                setIsInterviewing(false);
                setIsMeetingReady(false);
              });
            }}
            userInfo={{
              displayName: application.profile_data.fullname || application.profile_data.address,
              email: application.profile_data.email || ""
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.margin = '20px auto'
              iframeRef.style.height = '650px'
              iframeRef.style.width = '90vw'

              setIsMeetingReady(true)
            }}
          />
        </div>
      )}
    </div>
  )
}