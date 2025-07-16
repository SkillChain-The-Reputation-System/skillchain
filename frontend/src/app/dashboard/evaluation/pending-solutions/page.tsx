
import PendingSolutions from "@/features/evaluation/pending-solutions/pending-solutions";
import { Domain, SolutionSortOption } from "@/constants/system";
import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";

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
  const sort = Number(searchParams?.sort) || SolutionSortOption.NEWEST;
  const domain = searchParams?.domain !== undefined ? Number(searchParams?.domain) as Domain : null;
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="flex flex-col space-y-4">
      <PageHeader
        title="Pending Solutions"
        description="Find and evaluate solutions submitted by others."
      />

      <Separator />

      <div className="flex flex-col w-full">
        <PendingSolutions query={query} sort={sort} domain={domain} page={currentPage} />
      </div>
    </div>
  );
}