import { ReviewChallengeForm } from "@/features/moderation/review-challenge-form";
import { notFound } from "next/navigation";

// This function would fetch the challenge data based on the ID
// Replace with your actual data fetching logic
async function getChallengeData(id: string) {
  try {
    // Implement your data fetching logic here
    // For now, returning placeholder data
    return {
      challengeId: id,
      titleUrl: "https://arweave.net/example-title-url",
      descriptionUrl: "https://arweave.net/example-description-url",
      category: "algorithms",
      submissionDate: new Date().toISOString(),
    };
  } catch (error) {
    return null;
  }
}

export default async function ChallengePage({ params }: { params: { id: string } }) {
  const challengeData = await getChallengeData(params.id);
  
  if (!challengeData) {
    notFound();
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Review Challenge</h1>
      <ReviewChallengeForm
        challengeId={challengeData.challengeId}
        titleUrl={challengeData.titleUrl}
        descriptionUrl={challengeData.descriptionUrl}
        category={challengeData.category}
        submissionDate={challengeData.submissionDate}
      />
    </div>
  );
}
