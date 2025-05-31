'use client'

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import GeneralStatistics from "./general-statistics";
import JobsPieChart from "./jobs-pie-chart";
import JobApplicationFunnel from "./job-applications-funnel";
import TopJobs from "./top-jobs";
import TopApplicants from "./top-applicants";
import MeetingOverview from "./meetings-overview";

import {
  BriefMeetingInterface,
  JobPreviewInterface,
  JobApplicantionInterface
} from "@/lib/interfaces";
import {
  fetchApplicantsByJobID,
  fetchMeetingsByRecruiter,
  fetchPreviewJobsByRecruiter
} from "@/lib/fetching-onchain-data-utils";

export default function InsightsDashboard() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [jobs, setJobs] = useState<JobPreviewInterface[]>([]);
  const [meetings, setMeetings] = useState<BriefMeetingInterface[]>([]);
  const [jobsApplication, setJobsApplication] = useState<Record<string, JobApplicantionInterface[]>>({});

  useEffect(() => {
    const fetchJobs = async () => {
      if (!address)
        return;

      try {
        setIsLoading(true);
        const [fetchedJobs, fetchedMeetings] = await Promise.all([
          fetchPreviewJobsByRecruiter(address) as Promise<JobPreviewInterface[]>,
          fetchMeetingsByRecruiter(address) as Promise<BriefMeetingInterface[]>
        ]);

        setJobs(fetchedJobs);
        setMeetings(fetchedMeetings);

        const applicationPromises = fetchedJobs.map(async (job) => {
          try {
            const applications = await fetchApplicantsByJobID(job.id);
            return { jobId: job.id, applications };
          } catch (error) {
            console.error(`Failed to fetch applications for job ${job.id}:`, error);
            return { jobId: job.id, applications: [] };
          }
        });

        const applicationResults = await Promise.all(applicationPromises);
        const applicationsMap: Record<string, JobApplicantionInterface[]> = {};
        applicationResults.forEach(({ jobId, applications }) => {
          applicationsMap[jobId] = applications;
        });
        setJobsApplication(applicationsMap);
      }
      catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, [address])

  return (
    isLoading ? (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-35 w-80" />
          <Skeleton className="h-35 w-80" />
          <Skeleton className="h-35 w-80" />
          <Skeleton className="h-35 w-80" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-90 w-175" />
          <Skeleton className="h-90 w-175" />
        </div>
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        <GeneralStatistics jobs={jobs} meetings={meetings} jobsApplication={jobsApplication} />

        <Tabs defaultValue="overview" className="space-y-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="cursor-pointer">Overview</TabsTrigger>
            <TabsTrigger value="applications" className="cursor-pointer">Applications</TabsTrigger>
            <TabsTrigger value="applicants" className="cursor-pointer">Applicants</TabsTrigger>
            <TabsTrigger value="meetings" className="cursor-pointer">Meetings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <JobsPieChart jobs={jobs} />
              <JobApplicationFunnel jobsApplication={jobsApplication} />
            </div>
          </TabsContent>
          <TabsContent value="applications">
            <TopJobs jobs={jobs} jobsApplication={jobsApplication} />
          </TabsContent>
          <TabsContent value="applicants">
            <TopApplicants jobsApplication={jobsApplication} />
          </TabsContent>
          <TabsContent value="meetings">
            <MeetingOverview meetings={meetings} />
          </TabsContent>
        </Tabs>
      </div>
    )
  );
}