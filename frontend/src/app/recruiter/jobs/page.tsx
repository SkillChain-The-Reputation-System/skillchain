"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";
import { pageUrlMapping } from "@/constants/navigation";
import { PlusIcon } from "lucide-react";
import { DataTable, columns } from "@/features/jobs/jobs-table";
import { JobStatus } from "@/constants/system";
import { JobInterface } from "@/lib/interfaces";

export default function RecruiterJobsPage() {
  // Sample data - in a real application, this would come from an API
  const jobs: JobInterface[] = [
    {
      id: 1,
      title: "Senior Blockchain Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      applicants: 18,
      posted: new Date("2025-05-10"),
      status: JobStatus.OPEN,
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      department: "Engineering",
      location: "New York, NY",
      type: "Full-time",
      applicants: 24,
      posted: new Date("2025-05-08"),
      status: JobStatus.OPEN,
    },
    {
      id: 3,
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "Full-time",
      applicants: 32,
      posted: new Date("2025-05-05"),
      status: JobStatus.OPEN,
    },
    {
      id: 4,
      title: "UI/UX Designer",
      department: "Design",
      location: "Berlin, Germany",
      type: "Contract",
      applicants: 15,
      posted: new Date("2025-05-03"),
      status: JobStatus.PAUSED,
    },
    {
      id: 5,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      applicants: 9,
      posted: new Date("2025-04-28"),
      status: JobStatus.CLOSED,
    },
    {
      id: 6,
      title: "Data Scientist",
      department: "Data Science",
      location: "San Francisco, CA",
      type: "Full-time",
      applicants: 27,
      posted: new Date("2025-04-20"),
      status: JobStatus.FILLED,
    },
    {
      id: 7,
      title: "Marketing Specialist",
      department: "Marketing",
      location: "Remote",
      type: "Part-time",
      applicants: 42,
      posted: new Date("2025-04-15"),
      status: JobStatus.ARCHIVED,
    },
    {
      id: 8,
      title: "QA Engineer",
      department: "Engineering",
      location: "Berlin, Germany",
      type: "Full-time",
      applicants: 11,
      posted: new Date("2025-05-15"),
      status: JobStatus.DRAFT,
    },
  ];
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
      />
    </div>
  );
}
