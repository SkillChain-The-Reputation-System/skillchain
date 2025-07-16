import EvaluationDetail from '@/features/evaluation/evaluated-by-me/evualation-detail';
import { pageUrlMapping } from "@/constants/navigation";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ solutionId: `0x${string}` }>;
}) {
  const { solutionId } = await params;

  return (
    <div className="flex flex-col">
      <Link
        href={pageUrlMapping.evaluation_evaluatedbyme}
        className="flex gap-2 items-center mb-10 text-zinc-700 hover:underline hover:underline-offset-4 dark:text-zinc-300"
      >
        <MoveLeft className="h-4 w-4" />
        Back to Your Evaluations
      </Link>

      <EvaluationDetail solutionId={solutionId} />
    </div>
  );
}