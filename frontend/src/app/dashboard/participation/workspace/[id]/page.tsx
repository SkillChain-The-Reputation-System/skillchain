import WorkspaceChallenge from "@/features/participation/workspace/workspace-challenge";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container max-w-5xl py-5 px-4 md:px-0">
      <WorkspaceChallenge challenge_id={Number(id)} />
    </div>
  );
}