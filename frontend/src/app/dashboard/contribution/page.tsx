import { PageHeader } from "@/components/layout/page-header";
import { PlusIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { pageUrlMapping } from "@/constants/navigation";
import ContributionDashboard from "@/features/contribution/contribution-dashboard";

export default function ContributionPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Challenge Contribution"
        description="Work on challenges and track contributed ones"
        includeButton={true}
        buttonTitle="Create Challenge"
        buttonIcon={<PlusIcon className="h-4 w-4" />}
        buttonLink={pageUrlMapping.contribution_create}
      />
      <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />

      <ContributionDashboard />
    </div>
  );
}
