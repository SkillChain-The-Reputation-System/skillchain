import SolutionDetail from '@/features/evaluation/pending-solutions/solution-detail';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container max-w-5xl py-5 px-4 md:px-0">
      <SolutionDetail solutionId={Number(id)} />
    </div>
  );
}