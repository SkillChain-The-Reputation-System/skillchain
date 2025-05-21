import CreateJobForm from "@/features/jobs/create/create-job-form";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function CreateJobPage() {
  return (
    <div>
      <Link
        href="/recruiter/jobs"
        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4"
      >
        <ArrowLeftIcon /> Back to Jobs
      </Link>
      <CreateJobForm />
    </div>
  );
}
