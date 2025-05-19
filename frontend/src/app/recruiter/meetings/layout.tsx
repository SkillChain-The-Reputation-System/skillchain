import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";
import { PlusIcon } from "lucide-react";

export const metadata = {
  title: "Recruiter | Meetings",
  description: "Manage and schedule meetings with candidates.",
};

export default function MeetingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col px-4">
      <PageHeader
        title="Meetings"
        description="Schedule and manage candidate interviews."
        includeButton={true}
        buttonTitle="Schedule Meeting"
        buttonIcon={<PlusIcon className="h-4 w-4" />}
      />
      <Separator className="my-4 border-gray-300 dark:border-gray-700" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
