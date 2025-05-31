'use client'
import { useMemo } from "react"

import { Label, Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { meetingStatusChartColor } from "@/constants/styles";
import { JobDuration, JobDurationLabels, MeetingStatus, MeetingStatusLabels } from "@/constants/system";
import { BriefMeetingInterface } from "@/lib/interfaces"
import { format } from "date-fns";

interface MeetingOverviewProps {
  meetings: BriefMeetingInterface[],
}

export default function MeetingOverview({ meetings }: MeetingOverviewProps) {
  const chartData = generateMeetingStatusStatistics(meetings);
  const chartConfig = generateMeetingStatusConfig();
  const upcomingMeeting = getUpcomingMeetings(meetings);

  const totalMeetings = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.quantity, 0)
  }, [chartData])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="font-bold text-xl">Meeting Status Distribution</CardTitle>
          <CardDescription>Current status of all scheduled meeting</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="quantity"
                nameKey="status"
                innerRadius={55}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalMeetings.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Meetings
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="font-bold text-xl">Upcoming Meeting</CardTitle>
          <CardDescription>Scheduled interviews and meetings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcomingMeeting.map((meeting, index) => {

              return (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-300 dark:border-input rounded-lg">
                  <div className="flex flex-col gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage
                              src={meeting.applicant.avatar_url || ""}
                              alt={meeting.applicant.address || "Applicant"}
                            />
                            <AvatarFallback>
                              {meeting.applicant.fullname
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || "AP"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{meeting.applicant.fullname || meeting.applicant.address}</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent align="start">{meeting.applicant.address}</TooltipContent>
                    </Tooltip>
                    <div className="text-sm text-muted-foreground">
                      {meeting.job.position} - {JobDurationLabels[meeting.job.duration as JobDuration]}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 justify-items-end">
                    <div>{format(meeting.meetingDate.date, "PPP")}</div>
                    <div className="text-sm text-muted-foreground">
                      {meeting.meetingDate.fromTime} - {meeting.meetingDate.toTime}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface MeetingStatusStat {
  status: string;
  quantity: number;
  fill: string;
}

interface MeetingStatusConfig {
  [config: string]: {
    label: string,
    color?: string,
  }
}

function calculateUntilEvent(meeting: BriefMeetingInterface): number {
  const now = new Date();

  const [hours, minutes] = meeting.meetingDate.fromTime.split(':').map(Number);
  const meetingDateTime = new Date(meeting.meetingDate.date);
  meetingDateTime.setHours(hours, minutes, 0, 0);

  // Return positive value for future events, negative for past events
  return meetingDateTime.getTime() - now.getTime();
}

function getUpcomingMeetings(meetings: BriefMeetingInterface[]): BriefMeetingInterface[] {
  const now = new Date();

  return meetings
    .filter(meeting => {
      // Only include future meetings
      const timeUntilMeeting = calculateUntilEvent(meeting);
      return timeUntilMeeting > 0 && meeting.status == MeetingStatus.PENDING;
    })
    .sort((a, b) => {
      // Sort by closest meeting first
      const timeA = calculateUntilEvent(a);
      const timeB = calculateUntilEvent(b);
      return timeA - timeB;
    })
    .slice(0, 5);
}

function generateMeetingStatusStatistics(meetings: BriefMeetingInterface[]): MeetingStatusStat[] {
  const statusCounts: Record<MeetingStatus, number> = {
    [MeetingStatus.PENDING]: 0,
    [MeetingStatus.COMPLETED]: 0,
    [MeetingStatus.CANCELLED]: 0,
  };

  meetings.forEach(meeting => {
    statusCounts[meeting.status]++;
  });

  const chartData: MeetingStatusStat[] = Object.entries(statusCounts).map(([status, quantity]) => ({
    status: MeetingStatusLabels[Number(status) as MeetingStatus].toLowerCase(),
    quantity: quantity,
    fill: meetingStatusChartColor[Number(status) as MeetingStatus]
  }));

  return chartData;
}

function generateMeetingStatusConfig(): MeetingStatusConfig {
  const chartConfig: MeetingStatusConfig = {
    quantity: {
      label: "Meetings",
    },
  };

  Object.entries(MeetingStatusLabels).forEach(([statusValue, label]) => {
    const status = Number(statusValue) as MeetingStatus;
    const statusKey = label.toLowerCase();
    chartConfig[statusKey] = {
      label: label,
      color: meetingStatusChartColor[status],
    };
  });

  return chartConfig satisfies ChartConfig;
}