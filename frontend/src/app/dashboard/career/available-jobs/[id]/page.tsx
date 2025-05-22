"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  MapPin,
  Clock,
  Briefcase,
  Tags,
  Award,
  DollarSign,
  Users,
  CalendarCheck,
  AlertTriangle,
  ArrowLeftIcon,
  CheckCircle,
} from "lucide-react";
import { pageUrlMapping } from "@/constants/navigation";
import { fetchJobById } from "@/lib/fetching-onchain-data-utils";
import { JobInterface } from "@/lib/interfaces";
import {
  JobStatus,
  JobStatusLabels,
  JobDurationLabels,
  DomainLabels,
  Domain,
} from "@/constants/system";
import { format } from "date-fns";
import { toast } from "react-toastify";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const jobId = params.id as string;

  // Fetch job data
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        const jobData = await fetchJobById(jobId);
        setJob(jobData);
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast.error("Failed to fetch job details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);

  // Get status color based on job status
  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.OPEN:
        return "bg-green-100 text-green-800";
      case JobStatus.PAUSED:
        return "bg-amber-100 text-amber-800";
      case JobStatus.CLOSED:
        return "bg-red-100 text-red-800";
      case JobStatus.FILLED:
        return "bg-blue-100 text-blue-800";
      case JobStatus.DRAFT:
        return "bg-slate-100 text-slate-800";
      case JobStatus.ARCHIVED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Loading skeletons
  if (loading) {
    return (
      <div className="flex flex-col px-4 space-y-8">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-32 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-64 bg-slate-200 animate-pulse rounded-lg" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-32 bg-slate-200 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div className="flex flex-col px-4 items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-slate-600 mb-6">
          The job you are looking for doesn't exist or has been removed.
        </p>
        <Button
          onClick={() => router.push(pageUrlMapping.career_available_jobs)}
        >
          Go Back to Available Jobs
        </Button>
      </div>
    );
  }

  // Check if job is open
  const isJobOpen = job.status === JobStatus.OPEN;

  return (
    <div className="px-4">
      <Link
        href={pageUrlMapping.career_available_jobs}
        className={cn(buttonVariants(), "text-xs md:text-sm mb-4")}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Available Jobs
      </Link>

      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageHeader
            title={job.title}
            description={`Posted on ${format(job.posted, "MMMM d, yyyy")}`}
          />
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1 text-sm font-medium",
                getStatusColor(job.status)
              )}
            >
              {JobStatusLabels[job.status]}
            </Badge>
            {isJobOpen && <Button size="sm">Apply Now</Button>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 w-full">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    <span className="truncate" title={job.location || "Remote"}>
                      {job.location || "Remote"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    <span>{JobDurationLabels[job.duration]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    <span className="truncate" title={job.deadline ? `Apply by ${format(new Date(job.deadline), "MMMM d, yyyy")}` : "No deadline"}>
                      {job.deadline
                        ? `Apply by ${format(
                            new Date(job.deadline),
                            "MMMM d, yyyy"
                          )}`
                        : "No deadline"}
                    </span>
                  </div>
                </div>

                <Separator />
                <Tabs defaultValue="description" className="mt-4">
                  <TabsList>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="compensation">Compensation</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="pt-6">
                    <ScrollArea className="">
                      <div className="prose max-w-none">
                        {job.description ? (
                          <div
                            style={{
                              overflowWrap: "break-word",
                              wordBreak: "break-word",
                              hyphens: "auto",
                            }}
                          >
                            {job.description}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">
                            No description provided.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="requirements" className="pt-6">
                    <ScrollArea className="">
                      <div className="prose max-w-none">
                        {job.requirements ? (
                          <div
                            style={{
                              overflowWrap: "break-word",
                              wordBreak: "break-word",
                              hyphens: "auto",
                            }}
                          >
                            {job.requirements}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">
                            No specific requirements provided.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="compensation" className="pt-6">
                    <ScrollArea className="">
                      <div className="prose max-w-none">
                        {job.compensation ? (
                          <div
                            style={{
                              overflowWrap: "break-word",
                              wordBreak: "break-word",
                              hyphens: "auto",
                            }}
                          >
                            {job.compensation}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">
                            Compensation details not specified.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Location</span>
                  </div>
                  <span className="text-sm font-medium truncate max-w-[120px]" title={job.location || "Remote"}>
                    {job.location || "Remote"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <span className="text-sm font-medium">
                    {JobDurationLabels[job.duration]}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Applicants</span>
                  </div>
                  <span className="text-sm font-medium">
                    {job.applicants} candidates
                  </span>
                </div>
                {job.deadline > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">Deadline</span>
                    </div>
                    <span className="text-sm font-medium">
                      {format(new Date(job.deadline), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Required Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {job.domains && job.domains.length > 0 ? (
                    job.domains.map((domain) => (
                      <div key={domain} className="flex flex-col">
                        <Badge variant="secondary" className="mb-2 self-start">
                          {DomainLabels[domain as Domain]}
                        </Badge>
                        {job.domainReputations &&
                          job.domainReputations[domain as Domain] > 0 && (
                            <span className="text-sm text-slate-600">
                              Min Score:{" "}
                              {job.domainReputations[domain as Domain]}
                            </span>
                          )}
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">
                      No specific domains required.
                    </span>
                  )}

                  {job.requireGlobalReputation &&
                    job.globalReputationScore &&
                    job.globalReputationScore > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium">
                            Global Reputation Required
                          </span>
                        </div>
                        <span className="text-sm text-slate-600">
                          Minimum Score: {job.globalReputationScore}
                        </span>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {isJobOpen && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <h3 className="font-semibold">
                      Interested in this position?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Apply now to showcase your skills and experience to the
                      recruiter.
                    </p>
                    <Button className="mt-2 w-full">Apply for This Job</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
