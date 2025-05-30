"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";
import { fetchAllJobApplicationsByUser } from "@/lib/fetching-onchain-data-utils";
import { JobApplicationWithJobDataInterface } from "@/lib/interfaces";
import { toast } from "react-toastify";
import { ApplicationsTable } from "@/features/jobs-on-user/applications-table/data-table";
import { ApplicationColumns } from "@/features/jobs-on-user/applications-table/columns";
import { useAccount } from "wagmi";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<JobApplicationWithJobDataInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { address } = useAccount();
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const fetchedApplications = await fetchAllJobApplicationsByUser(address as `0x${string}`);
        setApplications(fetchedApplications);
      } catch (error) {
        console.error("Error fetching job applications:", error);
        toast.error("Failed to fetch your job applications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchApplications();
    }
  }, [address]);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="My Applications"
        description="View and manage your job applications."
      />
      <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
      
      <ApplicationsTable
        columns={ApplicationColumns}
        data={applications}
        searchPlaceholder="Search your applications..."
        isLoading={loading}
      />
    </div>
  );
}