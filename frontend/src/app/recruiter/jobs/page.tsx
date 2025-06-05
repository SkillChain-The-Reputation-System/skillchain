"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";
import { pageUrlMapping } from "@/constants/navigation";
import { PlusIcon } from "lucide-react";
import { DataTable, columns } from "@/features/jobs-on-recruiter/jobs-table";
import { JobStatus } from "@/constants/system";
import { JobPreviewInterface } from "@/lib/interfaces";
import { fetchPreviewJobsByRecruiter } from "@/lib/fetching-onchain-data-utils";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<JobPreviewInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const fetchJobs = async () => {
      if (isConnected && address) {
        try {
          setLoading(true);
          const fetchedJobs = await fetchPreviewJobsByRecruiter(address as `0x${string}`);
          setJobs(fetchedJobs);
        } catch (error) {
          console.error("Error fetching jobs:", error);
          toast.error("Failed to fetch jobs. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchJobs();
  }, [address, isConnected]);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Jobs"
        description="Manage and track your job postings."
        includeButton={true}
        buttonIcon={<PlusIcon className="h-4 w-4" />}
        buttonTitle="Create New Job"
        buttonLink={pageUrlMapping.recruiter_jobs_create}
      />
      <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
      <DataTable
        columns={columns}
        data={jobs}
        searchColumn="title"
        searchPlaceholder="Search jobs..."
        isLoading={loading}
      />
    </div>
  );
}
