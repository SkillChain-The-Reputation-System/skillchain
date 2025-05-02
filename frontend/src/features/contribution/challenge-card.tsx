'use client'

// Import UI components
import { GenericChallengeCard } from "@/components/generic-challenge-card"

// Import utils
import { ChallengeInterface } from "@/lib/interfaces"

interface ChallengeCardProps {
  challenge: ChallengeInterface
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  // Render using generic card with no primary action
  return <GenericChallengeCard challenge={challenge} primaryButton={null} />
}