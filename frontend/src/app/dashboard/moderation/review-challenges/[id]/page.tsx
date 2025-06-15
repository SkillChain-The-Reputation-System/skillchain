import { ReviewChallengeForm } from "@/features/moderation/review-challenge-form";

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ id: `0x${string}` }>;
}) {
  const { id } = await params; 
  return (
    <div>
      <ReviewChallengeForm challenge_id={id} key={id} />
    </div>
  );
}
