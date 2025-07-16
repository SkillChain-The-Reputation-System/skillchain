import ExploreChallengeDetails from "@/features/participation/explore/explore-challenge-details";
import { pageUrlMapping } from "@/constants/navigation";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: `0x${string}` }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col">
      <Link
        href={pageUrlMapping.participation_explore}
        className="flex gap-2 items-center mb-10 text-zinc-700 hover:underline hover:underline-offset-4 dark:text-zinc-300"
      >
        <MoveLeft className="h-4 w-4" />
        Back to Explore
      </Link>

      <ExploreChallengeDetails challenge_id={id} />
    </div>
  );
}
