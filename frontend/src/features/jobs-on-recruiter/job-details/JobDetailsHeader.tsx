"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Edit, Users, ArrowLeftIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pageUrlMapping } from "@/constants/navigation";
import { JobInterface } from "@/lib/interfaces";

interface JobDetailsHeaderProps {
  job: JobInterface;
  jobId: string;
}

export default function JobDetailsHeader({ job, jobId }: JobDetailsHeaderProps) {
  return (
    <>
      <Link
        href={pageUrlMapping.recruiter_jobs}
        className={cn(buttonVariants(), "text-xs md:text-sm mb-4")}
      >
        <ArrowLeftIcon /> Back to Jobs
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={job.title}
          description={`Posted on ${format(job.posted, "MMMM d, yyyy")}`}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/recruiter/jobs/${jobId}/applicants`} >
            <Button variant="secondary" className="cursor-pointer">
              <Users className="h-4 w-4 mr-2" />
              {job.applicants} Applicants
            </Button>
          </Link>
          <Link href={`/recruiter/jobs/${jobId}/edit`} >
            <Button className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
              Edit Job
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
