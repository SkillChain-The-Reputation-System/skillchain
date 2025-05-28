'use client'

import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import { usePathname, useRouter } from "next/navigation";

import { JaaSMeeting } from "@jitsi/react-sdk"

import {
  Briefcase,
  Calendar,
  CheckCircle,
  CircleDollarSign,
  FolderX,
  Mail,
  MapPinHouse,
  MapPinned,
  MessageSquareText,
  MoreHorizontal,
  PenLine,
  Presentation,
  UserRound,
  Users,
  Video,
  VideoOff,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner"

import {
  JobStatus,
  JobStatusLabels,
  JobDuration,
  JobDurationLabels,
  DomainLabels,
  Domain,
  MeetingStatus,
  MeetingStatusLabels
} from "@/constants/system";
import { jobStatusStyles, meetingStatusStyles } from "@/constants/styles";
import { format } from "date-fns";
import { fetchMeetingRoomById } from "@/lib/fetching-onchain-data-utils";
import { MeetingRoomInterface } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { calculateMeetingDuration } from "./time-utils";
import { cancelMeeting, completeMeeting } from "@/lib/write-onchain-utils";
import { Skeleton } from "@/components/ui/skeleton";

const JAAS_API_KEY = process.env.JAAS_API_KEY as string

if (JAAS_API_KEY === undefined) {
  throw new Error(`${JAAS_API_KEY} environment variable is not defined.`);
}

interface MeetingRoomProps {
  roomId: string
}

export default function MeetingRoom({ roomId }: MeetingRoomProps) {
  const jitsiRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();
  const router = useRouter();
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMeetingReady, setIsMeetingReady] = useState<boolean>(false);
  const [isInterviewing, setIsInterviewing] = useState<boolean>(false);

  const [meeting, setMeeting] = useState<MeetingRoomInterface | null>(null);

  const handleCompleteMeeting = async () => {
    if (!address || !meeting) {
      return;
    }

    try {
      await completeMeeting(address, meeting.id);

      setMeeting({
        ...meeting,
        status: MeetingStatus.COMPLETED,
      })

      toast.success("You've completed this meeting");
    } catch (error) {
      console.log("Error occurs: ", error)
      toast.error("Error occurs. Please try again")
    } finally {

    }
  }

  const handleRescheduleMeeting = () => {
    router.push(pathname + `/reschedule`);
  }

  const handleCancelMeeting = async () => {
    if (!address || !meeting) {
      return;
    }

    try {
      await cancelMeeting(address, meeting.id);

      setMeeting({
        ...meeting,
        status: MeetingStatus.CANCELLED,
      })
      toast.info("You've cancelled this meeting");
    } catch (error) {
      console.log("Error occurs: ", error)
      toast.error("Error occurs. Please try again")
    } finally {

    }
  }

  const handleStartMeeting = () => {
    setIsInterviewing(true);
    setIsMeetingReady(false);
  }

  const handleStopMeeting = () => {
    setIsInterviewing(false);
    setIsMeetingReady(false);
  }

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!address) {
        return;
      }

      try {
        setIsLoading(true);
        const fetchedMeeting = await fetchMeetingRoomById(roomId);
        setMeeting(fetchedMeeting);
      } catch (error) {
        console.error("Error fetching meetings:", error);
        toast.error("Failed to fetch jobs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeeting();
  }, [address])

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
    isLoading ? (
      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
          <Card>
            <CardHeader>
              <Skeleton className="h-10 w-[400px]" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-5 w-[300px]" />
                </div>

                <Skeleton className="h-35 w-35 rounded-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-[250px]" />
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-5 w-[300px]" />
              </div>

              <Separator className="my-4 border-gray-300" />

              <div className="space-y-2">
                <Skeleton className="h-5 w-[350px]" />
                <Skeleton className="h-5 w-[175px]" />
                <Skeleton className="h-5 w-[250px]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-10 w-[400px]" />
            </CardHeader>
            <CardContent>
              <div className="my-3 space-y-3">
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-[300px]" />
              </div>

              <div className="py-3 space-y-2">
                <Skeleton className="h-5 w-[250px]" />
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-5 w-[300px]" />
              </div>

              <Separator className="my-4 border-gray-300" />

              <div className="space-y-2">
                <Skeleton className="h-5 w-[350px]" />
                <Skeleton className="h-5 w-[175px]" />
                <Skeleton className="h-5 w-[250px]" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-[400px]" />
          </CardHeader>
          <CardContent>
            <div className="my-3 space-y-3">
              <Skeleton className="h-10 w-[200px]" />
              <Skeleton className="h-10 w-[300px]" />
            </div>

            <Separator className="my-4 border-gray-300" />

            <div className="py-3 space-y-2">
              <Skeleton className="h-5 w-[400px]" />
              <Skeleton className="h-5 w-[200px]" />
              <Skeleton className="h-5 w-[300px]" />
            </div>

            <Separator className="my-4 border-gray-300" />

            <div className="space-y-2">
              <Skeleton className="h-5 w-[350px]" />
              <Skeleton className="h-5 w-[600px]" />
              <Skeleton className="h-5 w-[440px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    ) : (
      meeting ? (
        <div className="mt-5 space-y-4">
          <Toaster position="top-right" richColors />

          <div className="flex items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="flex gap-4 items-center">
                <Calendar />
                <p className="font-bold text-2xl">Meeting Details</p>
              </div>

              <Badge className={cn(meetingStatusStyles[meeting.status as MeetingStatus])}>
                {MeetingStatusLabels[meeting.status as MeetingStatus]}
              </Badge>
            </div>

            {meeting.status == MeetingStatus.PENDING && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="cursor-pointer"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-bold">Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleCompleteMeeting}
                  >
                    <CheckCircle className="stroke-green-600 dark:stroke-green-400" />
                    <span className="text-green-600 dark:text-green-400">Mark as Completed</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleRescheduleMeeting}
                  >
                    <PenLine />
                    Reschedule
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleCancelMeeting}
                  >
                    <X className="stroke-red-600 dark:stroke-red-400" />
                    <span className="text-red-600 dark:text-red-400">Cancel</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <UserRound />
                  Applicant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-lg font-bold">{meeting.applicant.fullname}</p>
                      <p className="text-muted-foreground text-sm">{meeting.applicant.address}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{meeting.applicant.email}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPinHouse className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{meeting.applicant.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground italic">{meeting.applicant.bio}</span>
                      </div>
                    </div>
                  </div>

                  <Avatar className="h-35 w-35">
                    <AvatarImage
                      src={meeting.applicant.avatar_url}
                      alt={meeting.applicant.address}
                    />
                  </Avatar>
                </div>

                <Separator className="my-4 bg-gray-300" />

                <p className="font-bold text-lg">Reputations</p>

                <div className="grid grid-cols-3 gap-2">
                  {meeting.job.domains.map((domain) =>
                    <Badge key={domain}>{DomainLabels[domain as Domain]} : {meeting.applicantReputation.domain_reputation[domain]}</Badge>
                  )}
                </div>

                {meeting.job.requireGlobalReputation &&
                  <Badge className="mt-8">Global Reputation : {meeting.applicantReputation.global_reputation}</Badge>
                }
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Briefcase />
                  Job Position Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold">{meeting.job.title}</p>
                      <Badge
                        className={(jobStatusStyles[meeting.job.status as JobStatus])}
                      >
                        {JobStatusLabels[meeting.job.status as JobStatus]}
                      </Badge>
                    </div>

                    <div className="flex h-4 items-center gap-3">
                      <p className="text-muted-foreground text-sm">
                        {JobDurationLabels[meeting.job.duration as JobDuration]}
                      </p>
                      <Separator orientation="vertical" className="bg-gray-500" />
                      <p className="text-muted-foreground text-sm">
                        Posted on {format(meeting.job.posted, "PPP")} at {format(meeting.job.posted, "HH:mm")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">
                        {meeting.job.applicants} applicants
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">
                        {meeting.job.compensation}
                        {/* {mockData.jobInfo.salary} */}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPinned className="h-4 w-4 text-muted-foreground" />
                      <span className="flex gap-1.5 text-muted-foreground text-sm">
                        Work at
                        <p className="italic">{meeting.job.location}</p>
                        {/* <p className="italic">{mockData.jobInfo.location}</p> */}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-5 bg-gray-300" />

                <Tabs defaultValue="job-description">
                  <TabsList className="grid w-full grid-cols-3 mb-2">
                    <TabsTrigger value="job-description" className="cursor-pointer">Description</TabsTrigger>
                    <TabsTrigger value="job-requirement" className="cursor-pointer">Job Requirements</TabsTrigger>
                    <TabsTrigger value="reputation-requirements" className="cursor-pointer">Reputation Requirements</TabsTrigger>
                  </TabsList>
                  <TabsContent value="job-description">
                    <div className="wrap-break-word text-muted-foreground text-sm">{meeting.job.description}</div>
                  </TabsContent>
                  <TabsContent value="job-requirement">
                    <div className="wrap-break-word text-muted-foreground text-sm">{meeting.job.requirements}</div>
                  </TabsContent>
                  <TabsContent value="reputation-requirements">
                    <div className="grid grid-cols-3 gap-2">
                      {meeting.job.domains.map((domain) =>
                        <Badge key={domain}>{DomainLabels[domain as Domain]} : {meeting.job.domainReputations[domain]}</Badge>
                      )}
                    </div>

                    {meeting.job.requireGlobalReputation &&
                      <Badge className="mt-8">Global Reputation : {meeting.job.globalReputationScore}</Badge>
                    }
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Presentation />
                Meeting Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <h5 className="font-bold mb-1">Date & Time</h5>
                  <div className="flex flex-col text-sm text-muted-foreground gap-1">
                    {format(meeting.date, "PPP")}
                    <div>
                      {meeting.fromTime} - {meeting.toTime}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="font-bold mb-1">Duration</h5>
                  <p className="text-sm text-muted-foreground">
                    {calculateMeetingDuration(meeting.fromTime, meeting.toTime)} minutes
                  </p>
                </div>
              </div>

              {meeting.note && (
                <>
                  <Separator className="my-6 bg-gray-300" />
                  <div className="mb-4">
                    <h5 className="font-bold mb-2">Note for Applicant</h5>
                    <p className="text-sm text-muted-foreground">{meeting.note}</p>
                  </div>
                </>
              )}

              <Separator className="my-6 bg-gray-300" />
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold mb-1">Online Meeting</h5>
                  <p className="text-sm text-muted-foreground">Room ID: {meeting.roomId}</p>
                </div>

                <div className="flex gap-2">
                  {isInterviewing ? (
                    <Button
                      variant="destructive"
                      onClick={handleStopMeeting}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <VideoOff className="h-5 w-5" />
                      Stop Meeting
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStartMeeting}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Video className="h-5 w-5" />
                      Start Meeting
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {isInterviewing && (
            <div ref={jitsiRef}>
              <JaaSMeeting
                appId={JAAS_API_KEY}
                roomName={meeting.roomId}
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
                  displayName: 'Recruiter',
                  email: 'recruiter@example.com'
                }}
                getIFrameRef={(iframeRef) => { iframeRef.style.height = '650px'; setIsMeetingReady(true); }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 items-center py-30">
          <div className="bg-gray-300 rounded-full">
            <FolderX className="p-4 h-30 w-30" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Meeting not found</h2>
            <p className="text-muted-foreground mb-6">
              The meeting you're looking for doesn't exist or you haven't joined this meeting.
            </p>
          </div>
        </div>
      )
    )
  )
}
