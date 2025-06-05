"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageUrlMapping } from "@/constants/navigation";

export default function JobNotFound() {
  const router = useRouter();

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
