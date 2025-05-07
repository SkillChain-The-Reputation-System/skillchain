import Explore from "@/features/participation/explore";
import { ChallengeSortOption, Domain } from "@/constants/system"

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
    <div>
      <h1 className="flex flex-col items-center justify-center text-2xl font-bold mb-3">Grow your reputation!</h1>

      <div className="flex flex-col items-center justify-center p-4 w-full">
        <Explore query={query} sort={sort} domain={domain} page={currentPage} />
      </div>
    </div>
  );
}