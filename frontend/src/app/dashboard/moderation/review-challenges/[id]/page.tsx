import { ReviewChallengeForm } from "@/features/moderation/review-challenge-form";

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; 
  return (
    <div>
      <ReviewChallengeForm challenge_id={parseInt(id, 10)} key={id} />
    </div>
  );
}
