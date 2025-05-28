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
  Loader,
  Mail,
  MapPinHouse,
  MapPinned,
  MoreHorizontal,
  PenLine,
  Phone,
  Presentation,
  User,
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
import {
  fetchMeetingRoomById,
  fetchUserDomainReputationScore,
  fetchUserGlobalReputationScore
} from "@/lib/fetching-onchain-data-utils";
import { MeetingRoomInterface } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { calculateMeetingDuration } from "./time-utils";
import { cancelMeeting, completeMeeting } from "@/lib/write-onchain-utils";

const JAAS_API_KEY = process.env.JAAS_API_KEY as string

if (JAAS_API_KEY === undefined) {
  throw new Error(`${JAAS_API_KEY} environment variable is not defined.`);
}

const mockData = {
  applicantInfo: {
    fullName: 'Noelle',
    email: 'noelle@genshin.com',
    phoneNumber: '+69 123456789',
    location: 'Mondstadt, Teyvat'
  },
  jobInfo: {
    salary: '$11,000 - $13,000',
    location: 'Ly Tu Trong, Ben Nghe Ward, District 1, Ho Chi Minh City, Vietnam'
  },
  roomID: 'interview-noelle-3017240'
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

  const [domainReputation, setDomainReputation] = useState<Record<number, number>>();
  const [globalReputation, setGlobalReputation] = useState<number>();

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

        if (fetchedMeeting) {
          fetchedMeeting.job.domains.map(async (domain) => {
            const fetchedDomainReputation = await fetchUserDomainReputationScore(fetchedMeeting.applicant as `0x${string}`, domain as Domain);

            setDomainReputation(prev => ({
              ...prev,
              [domain]: fetchedDomainReputation,
            }));
          })

          if (fetchedMeeting.job.requireGlobalReputation) {
            const fetchedGlobalReputation = await fetchUserGlobalReputationScore(fetchedMeeting.applicant as `0x${string}`);
            setGlobalReputation(fetchedGlobalReputation)
          }
        }
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
      <div className="w-full h-120 flex justify-center items-center">
        <Loader className="h-30 w-30 animate-spin text-muted-foreground" />
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
                  <User />
                  Applicant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-lg font-bold">Noelle</p>
                      <p className="text-muted-foreground text-sm">{meeting.applicant}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{mockData.applicantInfo.email}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{mockData.applicantInfo.phoneNumber}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPinHouse className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{mockData.applicantInfo.location}</span>
                      </div>
                    </div>
                  </div>

                  <Avatar className="h-35 w-35">
                    <AvatarImage
                      src="https://i.pinimg.com/736x/8f/13/5c/8f135c93a94a54d9da854f389cf80a8f.jpg"
                      alt="A66"
                    />
                  </Avatar>
                </div>

                <Separator className="my-4 bg-gray-300" />

                <p className="font-bold text-lg">Applicant's Reputations</p>

                {domainReputation && (
                  <div className="grid grid-cols-3 gap-2">
                    {meeting.job.domains.map((domain) =>
                      <Badge key={domain}>{DomainLabels[domain as Domain]} : {domainReputation[domain]}</Badge>
                    )}
                  </div>
                )}

                {meeting.job.requireGlobalReputation &&
                  <Badge className="mt-8">Global Reputation : {globalReputation}</Badge>
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
                        {meeting.job.application_count} applicants
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
                    <p className="text-muted-foreground text-sm">{meeting.job.description}</p>
                  </TabsContent>
                  <TabsContent value="job-requirement">
                    <p className="text-muted-foreground text-sm">{meeting.job.requirements}</p>
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
                // eyJraWQiOiJ2cGFhcy1tYWdpYy1jb29raWUtYjA0MjRkZjA0MDY3NDk2MWIwZDQzN2MwMmI0NmNlYTcvMzM2OTA1LVNBTVBMRV9BUFAiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJqaXRzaSIsImlzcyI6ImNoYXQiLCJpYXQiOjE3NDg0MjA5NTMsImV4cCI6MTc0ODQyODE1MywibmJmIjoxNzQ4NDIwOTQ4LCJzdWIiOiJ2cGFhcy1tYWdpYy1jb29raWUtYjA0MjRkZjA0MDY3NDk2MWIwZDQzN2MwMmI0NmNlYTciLCJjb250ZXh0Ijp7ImZlYXR1cmVzIjp7ImxpdmVzdHJlYW1pbmciOnRydWUsIm91dGJvdW5kLWNhbGwiOnRydWUsInNpcC1vdXRib3VuZC1jYWxsIjpmYWxzZSwidHJhbnNjcmlwdGlvbiI6dHJ1ZSwicmVjb3JkaW5nIjp0cnVlfSwidXNlciI6eyJoaWRkZW4tZnJvbS1yZWNvcmRlciI6ZmFsc2UsIm1vZGVyYXRvciI6dHJ1ZSwibmFtZSI6Im1pbmhkYXR0cmFuMTE5OSIsImlkIjoiZ29vZ2xlLW9hdXRoMnwxMTIwMzY4Mjg2ODkzMjMwMTkwMzciLCJhdmF0YXIiOiIiLCJlbWFpbCI6Im1pbmhkYXR0cmFuMTE5OUBnbWFpbC5jb20ifX0sInJvb20iOiIqIn0.ITCkz7WWzYB8dRLlP-Nf66JvBd1jSrDWQxOPQjJ8B52cujPbGCQcafUyIUtKiwl2Rc3tynHj0t0Jd5YL_rOwy3G7egjb1fP_fs_nXA_Vz5XVutb45lXsD9cMlLJ0ELbGtzAVAC1tanK7Egd6CAk-AiS9uuuawZl1IGwAduh-NO_Y_AzVXcx9Xfx1Sh_WuLAxFu_27DrKX1XDeSHQKIxFyNj7LxxoT8XDh0H09FcLomcbfp15ESaurvMRAkdrLcMaXh9t3bnzFeAZns67qqbFBaJFP9xsRZakJrQOHw-dwSWF0klQPjmJxXroaS4TzN_dEjdTB4x1O7IpwVc8o6JlzQ
                getIFrameRef={(iframeRef) => { iframeRef.style.height = '650px'; setIsMeetingReady(true); }}
              />
            </div>
          )}
        </div>
      ) : (
        <></>
      )
    )
  )
}
