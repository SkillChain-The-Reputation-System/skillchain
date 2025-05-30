import MeetingsDashboard from "@/features/meetings/meetings-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";
import { PlusIcon } from "lucide-react";
import { pageUrlMapping } from "@/constants/navigation";

export default function MeetingsPage() {

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Meetings"
        description="Schedule and manage candidate interviews."
        includeButton={true}
        buttonTitle="Schedule Meeting"
        buttonIcon={<PlusIcon className="h-4 w-4" />}
        buttonLink={pageUrlMapping.recruiter_schedule}
      />
      <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
      <MeetingsDashboard />
    </div>
  )
}