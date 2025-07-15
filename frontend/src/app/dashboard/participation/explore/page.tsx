
import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";
import Explore from "@/features/participation/explore/explore";
import { ChallengeSortOption, Domain } from "@/constants/system";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    sort?: string;
    domain?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const sort = Number(searchParams?.sort) || ChallengeSortOption.NEWEST;
  const domain = searchParams?.domain !== undefined ? Number(searchParams?.domain) as Domain : null;
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="flex flex-col px-4">
      <PageHeader
        title="Explore challenges"
        description="Explore and solve challenges to build your reputation."
      />
      <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
      <div className="flex flex-col items-center justify-center p-4 w-full">
        <Explore query={query} sort={sort} domain={domain} page={currentPage} />
      </div>
    </div>
  );
}