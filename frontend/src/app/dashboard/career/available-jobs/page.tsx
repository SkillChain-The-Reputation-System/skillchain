"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";
import { fetchJobsNotAppliedByUser } from "@/lib/fetching-onchain-data-utils";
import { JobInterface } from "@/lib/interfaces";
import { toast } from "react-toastify";
import {
  OpeningJobsTable,
  columns,
} from "@/features/jobs-on-user/opening-jobs-table";
import { useAccount } from "wagmi";

export default function AvailableJobsPage() {
  const [jobs, setJobs] = useState<JobInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { address } = useAccount();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const fetchedJobs = await fetchJobsNotAppliedByUser(address as `0x${string}`);
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Error fetching open jobs:", error);
        toast.error("Failed to fetch open jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Available Jobs"
        description="Browse and search for open job opportunities."
      />
      <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />

      <OpeningJobsTable
        columns={columns}
        data={jobs}
        searchPlaceholder="Search by job title, location, or description..."
        isLoading={loading}
      />
    </div>
  );
}
