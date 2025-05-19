"use client";

// Import hooks
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Import UI components
import { Button } from "@/components/ui/button";
import { GenericChallengeCard } from "@/components/generic-challenge-card";

// Import utils
import { ChallengeInterface } from "@/lib/interfaces";
import { pageUrlMapping } from "@/constants/navigation";

export interface ChallengeCardProps {
  challenge: ChallengeInterface;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const router = useRouter();

  const handleEditReviewClick = () => {
    router.push(
      pageUrlMapping.moderation_reviewchallenges + `/${challenge.id}`
    );
  };

  const primaryButton = (
    <Button
      variant="default"
      className="cursor-pointer"
      onClick={handleEditReviewClick}
    >
      Edit review
    </Button>
  );

  return (
    <GenericChallengeCard challenge={challenge} primaryButton={primaryButton} />
  );
}
