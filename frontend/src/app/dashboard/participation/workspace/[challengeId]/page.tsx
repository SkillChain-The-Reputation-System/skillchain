import WorkspaceChallenge from "@/features/participation/workspace/workspace-challenge";
import { pageUrlMapping } from "@/constants/navigation";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

export default async function ChallengeWorkspacePage({
  params,
}: {
  params: Promise<{ challengeId: `0x${string}` }>;
}) {
  const { challengeId } = await params;

  return (
    <div className="flex flex-col px-12">
      <Link
        href={pageUrlMapping.participation_workspace}
        className="flex gap-2 items-center mb-10 text-zinc-700 hover:underline hover:underline-offset-4 dark:text-zinc-300"
      >
        <MoveLeft className="h-4 w-4" />
        Back to Workspace
      </Link>

      <WorkspaceChallenge challenge_id={challengeId} />
    </div>
  );
}
