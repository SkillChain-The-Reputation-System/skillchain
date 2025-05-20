import EvaluationPools from "@/features/evaluation/evaluated-by-me/evaluation-pools";
import { Domain } from "@/constants/system"

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
    <div>
      <h1 className="flex flex-col items-center justify-center text-2xl font-bold mb-3">Work on your evaluation</h1>

      <div className="flex flex-col items-center justify-center p-4 w-full">
        <EvaluationPools query={query} domain={domain} page={currentPage} />
      </div>
    </div>
  );
}