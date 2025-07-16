import { buttonVariants } from "@/components/ui/button";
import { pageUrlMapping } from "@/constants/navigation";
import CreateJobForm from "@/features/jobs-on-recruiter/create/create-job-form";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function CreateJobPage() {
  return (
    <div>
      <Link
        href={pageUrlMapping.recruiter_jobs}
        className="flex gap-2 items-center mb-2 text-primary hover:underline hover:underline-offset-4"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to Jobs
      </Link>
      <CreateJobForm />
    </div>
  );
}
