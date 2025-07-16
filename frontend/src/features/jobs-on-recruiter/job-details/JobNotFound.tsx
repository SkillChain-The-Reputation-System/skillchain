"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeftIcon } from "lucide-react";
import { pageUrlMapping } from "@/constants/navigation";
import Link from "next/link";

export default function JobNotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col px-4 items-center justify-center py-12">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
      <p className="text-slate-600 mb-6">
        The job you are looking for doesn't exist or has been removed.
      </p>
      <Link
        href={pageUrlMapping.recruiter_jobs}
        className="flex gap-2 items-center text-primary hover:underline hover:underline-offset-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Go Back to Jobs
      </Link>
    </div>
  );
}
