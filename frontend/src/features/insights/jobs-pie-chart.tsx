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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { JobPreviewInterface } from "@/lib/interfaces";
import { JobStatus, JobStatusLabels } from "@/constants/system";
import { jobStatusChartColor } from "@/constants/styles";

interface JobsPieChartProps {
  jobs: JobPreviewInterface[]
}

export default function JobsPieChart({ jobs }: JobsPieChartProps) {
  // const chartData = [
  //   { status: "draft", quantity: 4, fill: "var(--color-slate-400)" },
  //   { status: "open", quantity: 7, fill: "var(--color-green-500)" },
  //   { status: "paused", quantity: 3, fill: "var(--color-amber-400)" },
  //   { status: "closed", quantity: 6, fill: "var(--color-red-600)" },
  //   { status: "filled", quantity: 9, fill: "var(--color-blue-600)" },
  //   { status: "archived", quantity: 3, fill: "var(--color-gray-600)" },
  // ]
  const chartData = generateJobStatusStatistics(jobs);
  const chartConfig = generateJobStatusConfig();

  const totalJobs = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.quantity, 0)
  }, [chartData])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-bold text-xl">Job Status Distribution</CardTitle>
        <CardDescription>Current status of all job postings</CardDescription>
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
                          {totalJobs.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Jobs
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
  )
}

interface JobStatusStat {
  status: string;
  quantity: number;
  fill: string;
}

interface JobStatusConfig {
  [config: string]: {
    label: string,
    color?: string,
  }
}

function generateJobStatusStatistics(jobs: JobPreviewInterface[]): JobStatusStat[] {
  const statusCounts: Record<JobStatus, number> = {
    [JobStatus.DRAFT]: 0,
    [JobStatus.OPEN]: 0,
    [JobStatus.PAUSED]: 0,
    [JobStatus.CLOSED]: 0,
    [JobStatus.FILLED]: 0,
    [JobStatus.ARCHIVED]: 0,
  };

  jobs.forEach(job => {
    statusCounts[job.status]++;
  });

  const chartData: JobStatusStat[] = Object.entries(statusCounts).map(([status, quantity]) => ({
    status: JobStatusLabels[Number(status) as JobStatus].toLowerCase(),
    quantity: quantity,
    fill: jobStatusChartColor[Number(status) as JobStatus]
  }));

  return chartData;
}

function generateJobStatusConfig(): JobStatusConfig {
  const chartConfig: JobStatusConfig = {
    quantity: {
      label: "Jobs",
    },
  };

  Object.entries(JobStatusLabels).forEach(([statusValue, label]) => {
    const status = Number(statusValue) as JobStatus;
    const statusKey = label.toLowerCase();
    chartConfig[statusKey] = {
      label: label,
      color: jobStatusChartColor[status],
    };
  });

  return chartConfig satisfies ChartConfig;
}