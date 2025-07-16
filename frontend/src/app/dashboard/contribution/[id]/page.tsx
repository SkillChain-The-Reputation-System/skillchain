import { pageUrlMapping } from "@/constants/navigation";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import ChallengeDetails from "@/features/contribution/challenge-details";

export default async function ContributionChallengePage({
  params,
}: {
  params: Promise<{ id: `0x${string}` }>;
}) {
  const { id } = await params;

  return (
    <div  className="flex flex-col">
      <Link
        href={pageUrlMapping.contribution}
        className="flex gap-2 items-center mb-10 text-zinc-700 hover:underline hover:underline-offset-4 dark:text-zinc-300"
      >
        <MoveLeft className="h-4 w-4" />
        Back to Contribution Dashboard
      </Link>

      <ChallengeDetails id={id} />
    </div>
  )
}
