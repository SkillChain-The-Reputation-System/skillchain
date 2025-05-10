import Workspace from "@/features/participation/workspace/workspace";
import { Domain, ChallengeSolutionProgress } from "@/constants/system"

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
    <div>
      <h1 className="flex flex-col items-center justify-center text-2xl font-bold mb-3">Work on your solution!</h1>

      <div className="flex flex-col items-center justify-center p-4 w-full">
        <Workspace query={query} domain={domain} progress={progress} page={currentPage} />
      </div>
    </div>
  );
}