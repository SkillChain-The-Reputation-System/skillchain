import Workspace from "@/features/participation/workspace/workspace";
import { Domain, ChallengeSolutionProgress } from "@/constants/system"
import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    // sort?: string;
    domain?: string;
    progress?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';

  const domain = searchParams?.domain !== undefined ? Number(searchParams?.domain) as Domain : null;
  const progress = searchParams?.progress !== undefined ? Number(searchParams?.progress) as ChallengeSolutionProgress : null;
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Solution Workspace"
        description="Manage the solutions for the challenges you have taken part in"
      />
      <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
      <div className="flex flex-col items-center justify-center w-full">
        <Workspace query={query} domain={domain} progress={progress} page={currentPage} />
      </div>
    </div>
  );
}