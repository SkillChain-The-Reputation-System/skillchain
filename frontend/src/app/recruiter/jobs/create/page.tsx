import { buttonVariants } from "@/components/ui/button";
import { pageUrlMapping } from "@/constants/navigation";
import CreateJobForm from "@/features/jobs/create/create-job-form";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function CreateJobPage() {
  return (
    <div>
      <Link
        href={pageUrlMapping.recruiter_jobs}
        className={cn(buttonVariants(), "text-xs md:text-sm mb-2")}
      >
        <ArrowLeftIcon /> Back to Jobs
      </Link>
      <CreateJobForm />
    </div>
  );
}
