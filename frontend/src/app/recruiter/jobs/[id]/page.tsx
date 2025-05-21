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
  CheckCircle,
  PauseCircle,
  XCircle,
  ArchiveIcon,
  FileEdit,
  CheckIcon,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pageUrlMapping } from "@/constants/navigation";
import {
  fetchJobById,
  getPossibleJobStatusTransitions,
} from "@/lib/fetching-onchain-data-utils";
import { updateJobStatus } from "@/lib/write-onchain-utils";
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
  const [statusLoading, setStatusLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<JobStatus | null>(null);
  const [possibleStatuses, setPossibleStatuses] = useState<JobStatus[]>([]);
  const jobId = params.id as string;

  // Fetch job data and possible status transitions
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        const jobData = await fetchJobById(jobId);
        setJob(jobData);

        // Get possible status transitions
        if (jobData) {
          try {
            const transitions = await getPossibleJobStatusTransitions(
              jobData.status
            );
            setPossibleStatuses(transitions);
          } catch (transitionError) {
            console.error(
              "Error fetching status transitions:",
              transitionError
            );
            // Clear transitions as fallback
            setPossibleStatuses([]);
          }
        }
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

  function removePointerEventsFromBody() {
    if (document.body.style.pointerEvents === "none") {
      document.body.style.pointerEvents = "";
    }
  }

  // Handle status change
  const handleStatusChange = (status: JobStatus) => {
    if (job && status !== job.status) {
      setNewStatus(status);
      setIsDialogOpen(true);
    }
  };
  // Confirm status change
  const confirmStatusChange = async () => {
    if (!job || !newStatus) return;

    try {
      setStatusLoading(true);
      await updateJobStatus(jobId, newStatus);

      // Clear dialog state first
      setIsDialogOpen(false);

      // Update job status locally
      setJob((prevJob) => {
        if (!prevJob) return null;
        return {
          ...prevJob,
          status: newStatus,
        };
      });

      // Show success message
      toast.success(`Job status updated to ${JobStatusLabels[newStatus]}`);

      // Update possible transitions for the new status in a separate operation
      try {
        const transitions = await getPossibleJobStatusTransitions(newStatus);
        setPossibleStatuses(transitions);
      } catch (transitionError) {
        console.error("Error fetching status transitions:", transitionError);
        // Set empty transitions as fallback
        setPossibleStatuses([]);
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update job status. Please try again later.");
    } finally {
      setStatusLoading(false);
      setNewStatus(null);
    }
  };

  // Get status change message
  const getStatusChangeMessage = (
    currentStatus: JobStatus,
    newStatus: JobStatus
  ): string => {
    switch (newStatus) {
      case JobStatus.OPEN:
        return currentStatus === JobStatus.DRAFT
          ? "Publishing this job will make it visible to all users."
          : "Resuming this job will make it visible to users again.";
      case JobStatus.PAUSED:
        return "Pausing this job will temporarily hide it from users.";
      case JobStatus.CLOSED:
        return "Closing this job will permanently end the application process.";
      case JobStatus.FILLED:
        return "Marking this job as filled will indicate that the position has been successfully filled.";
      case JobStatus.ARCHIVED:
        return "Archiving this job will move it to your archived jobs section.";
      default:
        return "Are you sure you want to change the status of this job?";
    }
  };

  // Get status icon
  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case JobStatus.OPEN:
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case JobStatus.PAUSED:
        return <PauseCircle className="h-6 w-6 text-amber-500" />;
      case JobStatus.CLOSED:
        return <XCircle className="h-6 w-6 text-red-500" />;
      case JobStatus.FILLED:
        return <CheckIcon className="h-6 w-6 text-blue-500" />;
      case JobStatus.DRAFT:
        return <FileEdit className="h-6 w-6 text-slate-500" />;
      case JobStatus.ARCHIVED:
        return <ArchiveIcon className="h-6 w-6 text-gray-500" />;
      default:
        return null;
    }
  };

  // Get button color for status
  const getStatusButtonColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.OPEN:
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case JobStatus.PAUSED:
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case JobStatus.CLOSED:
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case JobStatus.FILLED:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case JobStatus.DRAFT:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200";
      case JobStatus.ARCHIVED:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200";
    }
  };

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

      {/* Status Change Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Job Status</DialogTitle>
            <DialogDescription>
              {job && newStatus
                ? getStatusChangeMessage(job.status, newStatus)
                : "Change the status of this job?"}
            </DialogDescription>
          </DialogHeader>

          {job && newStatus && (
            <div className="flex justify-center items-center gap-5 py-6">
              <div className="flex flex-col items-center">
                {getStatusIcon(job.status)}
                <span className="mt-2 text-sm font-medium">Current</span>
              </div>

              <ArrowLeftIcon className="h-5 w-5 transform rotate-180" />

              <div className="flex flex-col items-center">
                {getStatusIcon(newStatus)}
                <span className="mt-2 text-sm font-medium">New</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setNewStatus(null);
              }}
              disabled={statusLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              disabled={statusLoading}
              className={newStatus ? getStatusButtonColor(newStatus) : ""}
            >
              {statusLoading ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Processing...
                </>
              ) : (
                "Confirm Change"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
            <Link href={`/recruiter/jobs/${jobId}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Job Details</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`flex items-center gap-1 focus:outline-none ${
                          possibleStatuses.length === 0 || statusLoading
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        disabled={
                          possibleStatuses.length === 0 || statusLoading
                        }
                        type="button"
                      >
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {JobStatusLabels[job.status] || "Unknown"}
                        </span>
                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {possibleStatuses.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          className={`flex items-center gap-2 ${
                            status === job.status ? "font-bold" : ""
                          }`}
                          onClick={() => {
                            removePointerEventsFromBody();
                            handleStatusChange(status);
                          }}
                        >
                          {getStatusIcon(status)}
                          <span>{JobStatusLabels[status]}</span>
                        </DropdownMenuItem>
                      ))}
                      {possibleStatuses.length === 0 && (
                        <DropdownMenuItem disabled>
                          No status changes available
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          style={{
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                            hyphens: "auto",
                          }}
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
                          style={{
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                            hyphens: "auto",
                          }}
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
                          style={{
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                            hyphens: "auto",
                          }}
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
                    {format(job.posted, "MMM d, yyyy h:mm a")}
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
                      ? format(new Date(job.deadline), "MMM d, yyyy h:mm a")
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
                      Minimum score required:
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
