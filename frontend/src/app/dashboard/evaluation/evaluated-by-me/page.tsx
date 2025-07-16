import EvaluationPools from "@/features/evaluation/evaluated-by-me/evaluation-pools";
import { Domain } from "@/constants/system"
import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    domain?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';

  const domain = searchParams?.domain !== undefined ? Number(searchParams?.domain) as Domain : null;
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="flex flex-col space-y-4">
      <PageHeader
        title="My evaluations"
        description="Review and continue working on your evaluations."
      />

      <Separator />

      <div className="flex flex-col w-full">
        <EvaluationPools query={query} domain={domain} page={currentPage} />
      </div>
    </div>
  );
}