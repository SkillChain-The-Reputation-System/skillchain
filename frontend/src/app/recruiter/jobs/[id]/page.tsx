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
import {
  Calendar,
  Edit,
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
} from "lucide-react";
import { pageUrlMapping } from "@/constants/navigation";
import { fetchJobById } from "@/lib/fetching-onchain-data-utils";
import { JobInterface } from "@/lib/interfaces";
import {
  JobStatus,
  JobStatusLabels,
  JobDurationLabels,
  DomainLabels,
} from "@/constants/system";
import { format } from "date-fns";
import { toast } from "react-toastify";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const jobId = params.id as string;

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

  if (!job) {
    return (
      <div className="flex flex-col px-4 items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-slate-600 mb-6">
          The job you are looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push(pageUrlMapping.recruiter_jobs)}>
          Go Back to Jobs
        </Button>
      </div>
    );
  }
  return (
    <div className="px-4">
      <Link
        href={pageUrlMapping.recruiter_jobs}
        className={cn(buttonVariants(), "text-xs md:text-sm mb-4")}
      >
        <ArrowLeftIcon /> Back to Jobs
      </Link>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageHeader
            title={job.title}
            description={`Posted on ${format(job.posted, "MMMM d, yyyy")}`}
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/recruiter/jobs/${jobId}/applicants`}>
              <Button variant="secondary">
                <Users className="h-4 w-4 mr-2" />
                {job.applicants} Applicants
              </Button>
            </Link>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Job
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Job Details</CardTitle>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {JobStatusLabels[job.status] || "Unknown"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {" "}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-slate-500" />
                    <span
                      className="truncate"
                      title={job.location || "Unknown"}
                    >
                      {job.location || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    <span>{JobDurationLabels[job.duration]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-slate-500" />
                    <span>
                      {job.deadline
                        ? `Apply by ${new Date(
                            job.deadline
                          ).toLocaleDateString()}`
                        : "No deadline"}
                    </span>
                  </div>
                </div>

                <Separator />

                <Tabs defaultValue="description">
                  <TabsList>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="compensation">Compensation</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="pt-6">
                    <div className="prose max-w-none">
                      {job.description ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: job.description }}
                        />
                      ) : (
                        <p className="text-slate-500 italic">
                          No description provided.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="requirements" className="pt-6">
                    <div className="prose max-w-none">
                      {job.requirements ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: job.requirements }}
                        />
                      ) : (
                        <p className="text-slate-500 italic">
                          No requirements specified.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="compensation" className="pt-6">
                    <div className="prose max-w-none">
                      {job.compensation ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: job.compensation }}
                        />
                      ) : (
                        <p className="text-slate-500 italic">
                          No compensation details provided.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Domain Expertise</CardTitle>
                <CardDescription>
                  Required skills and expertise for this position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.domains && job.domains.length > 0 ? (
                    job.domains.map((domain) => (
                      <div
                        key={domain}
                        className="flex flex-col items-center p-3 border rounded-lg"
                      >
                        <Badge variant="secondary" className="mb-2">
                          {DomainLabels[domain]}
                        </Badge>
                        {job.domainReputations &&
                        job.domainReputations[domain] ? (
                          <span className="text-sm text-slate-600">
                            Min Score: {job.domainReputations[domain]}
                          </span>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">
                      No specific domains required.
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Posted</span>
                  </div>
                  <span className="text-sm font-medium">
                    {format(job.posted, "MMM d, yyyy")}
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
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Compensation</span>
                  </div>
                  <span className="text-sm font-medium">
                    {job.compensation ? "Available" : "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Deadline</span>
                  </div>
                  <span className="text-sm font-medium">
                    {job.deadline
                      ? new Date(job.deadline).toLocaleDateString()
                      : "None"}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col w-full gap-3">
                  <Link
                    href={`/recruiter/jobs/${jobId}/applicants`}
                    className="w-full"
                  >
                    <Button className="w-full">View Applicants</Button>
                  </Link>
                  {job.status === JobStatus.OPEN && (
                    <Button variant="outline" className="w-full">
                      Pause Job
                    </Button>
                  )}
                  {job.status === JobStatus.PAUSED && (
                    <Button variant="outline" className="w-full">
                      Resume Job
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reputation Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {job.requireGlobalReputation ? (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">Global Reputation</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Minimum score required:{" "}
                      <span className="font-medium">
                        {job.globalReputationScore}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-600">
                    No global reputation required
                  </p>
                )}

                {job.domains &&
                  job.domains.length > 0 &&
                  job.domainReputations && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Tags className="h-4 w-4 text-slate-500" />
                          <span className="font-medium">Domain Reputation</span>
                        </div>
                        <div className="space-y-2">
                          {job.domains.map((domain) => (
                            <div
                              key={`domain-${domain}`}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm">
                                {DomainLabels[domain]}
                              </span>
                              <Badge variant="outline">
                                {job.domainReputations[domain]}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
