import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";
import { PlusIcon } from "lucide-react";

export const metadata = {
  title: "Recruiter | Jobs",
  description: "Manage and review job postings.",
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col px-4">
      <PageHeader
        title="Jobs"
        description="Manage and track your job postings."
        includeButton={true}
        buttonIcon={<PlusIcon className="h-4 w-4" />}
        buttonTitle="Create New Job"
      />
      <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
