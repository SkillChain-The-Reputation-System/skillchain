import SolutionDetail from "@/features/evaluation/pending-solutions/solution-detail";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { pageUrlMapping } from "@/constants/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ solutionId: `0x${string}` }>;
}) {
  const { solutionId } = await params;

  return (
    <div className="flex flex-col">
      <Link
        href={pageUrlMapping.evaluation_pendingsolutions}
        className="flex gap-2 items-center mb-10 text-primary hover:underline hover:underline-offset-4"
      >
        <MoveLeft className="h-4 w-4" />
        Back to Solutions Explore
      </Link>

      <SolutionDetail solutionId={solutionId} />
    </div>
  );
}
