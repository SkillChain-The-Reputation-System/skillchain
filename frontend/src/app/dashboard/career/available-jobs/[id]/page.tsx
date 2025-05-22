"use client";

import { useState, useEffect, Suspense, lazy } from "react";
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
  XCircle,
  InfoIcon,
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
import { useAccount } from "wagmi";
import { checkUserValidToApplyForJob } from "@/lib/guards/recruitement";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Lazy load the job component cards
const JobDetailsCard = lazy(() => import('@/features/jobs-on-user/job-details-card'));
const JobOverviewCard = lazy(() => import('@/features/jobs-on-user/job-overview-card'));
const RequiredSkillsCard = lazy(() => import('@/features/jobs-on-user/required-skills-card'));

// Loading fallback component
function CardSkeleton() {
  return (
    <div className="border rounded-xl py-6 shadow-sm space-y-4">
      <div className="px-6 flex gap-2">
        <div className="h-6 w-6 rounded-md bg-slate-200 animate-pulse"></div>
        <div className="h-6 w-36 rounded-md bg-slate-200 animate-pulse"></div>
      </div>
      <div className="px-6">
        <div className="h-24 bg-slate-200 animate-pulse rounded-lg"></div>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const { address, isConnected } = useAccount();
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

  // Check if user is eligible to apply when job is loaded and user is connected
  useEffect(() => {
    const checkEligibility = async () => {
      if (job && isConnected && address) {
        setIsCheckingEligibility(true);
        try {
          const eligible = await checkUserValidToApplyForJob(address, jobId);
          setIsEligible(eligible);
        } catch (error) {
          console.error("Error checking eligibility:", error);
          setIsEligible(false);
        } finally {
          setIsCheckingEligibility(false);
        }
      }
    };

    checkEligibility();
  }, [job, isConnected, address, jobId]);
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

  // Get eligibility notification data
  const getEligibilityNotification = () => {
    if (!isConnected) {
      return {
        type: "warning",
        message: "Connect your wallet to check eligibility for this job",
        icon: <InfoIcon className="h-5 w-5" />,
        style: "bg-blue-50 border-blue-200 text-blue-800",
      };
    }

    if (isCheckingEligibility) {
      return {
        type: "loading",
        message: "Checking your eligibility for this job...",
        icon: (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ),
        style: "bg-slate-50 border-slate-200 text-slate-800",
      };
    }

    if (isEligible === true) {
      return {
        type: "success",
        message: "You are eligible to apply for this job!",
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        style: "bg-green-50 border-green-200 text-green-800",
      };
    }

    if (isEligible === false) {
      return {
        type: "error",
        message: "You don't meet the requirements for this job",
        icon: <XCircle className="h-5 w-5 text-red-600" />,
        style: "bg-red-50 border-red-200 text-red-800",
      };
    }

    return null;
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
        {/* Eligibility Notification Banner */}
        {getEligibilityNotification() && (
          <div
            className={cn(
              "border px-4 py-3 rounded-lg flex items-center gap-3",
              getEligibilityNotification()?.style
            )}
          >
            {getEligibilityNotification()?.icon}
            <p className="text-sm font-medium">
              {getEligibilityNotification()?.message}
            </p>
          </div>
        )}
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
            {isJobOpen &&
              (isEligible === false ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button size="sm" disabled>
                          Apply Now
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>You don't meet the requirements for this job</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Button
                  size="sm"
                  disabled={isEligible === null || isCheckingEligibility}
                >
                  Apply Now
                </Button>
              ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {job && (
              <Suspense fallback={<CardSkeleton />}>
                <JobDetailsCard job={job} />
              </Suspense>
            )}
          </div>

          <div className="space-y-6">
            {job && (
              <Suspense fallback={<CardSkeleton />}>
                <JobOverviewCard job={job} />
              </Suspense>
            )}
            {job && (
              <Suspense fallback={<CardSkeleton />}>
                <RequiredSkillsCard job={job} />
              </Suspense>
            )}
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
                    {isEligible === false ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button disabled className="mt-2 w-full">
                                Apply for This Job
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>You don't meet the requirements for this job</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Button
                        className="mt-2 w-full"
                        disabled={isEligible === null || isCheckingEligibility}
                      >
                        Apply for This Job
                      </Button>
                    )}
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
