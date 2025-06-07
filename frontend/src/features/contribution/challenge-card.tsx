"use client"

import { ReactNode } from "react"

// Import UI components
import { GenericChallengeCard } from "@/components/generic-challenge-card"

// Import utils
import { ChallengeInterface } from "@/lib/interfaces"

interface ChallengeCardProps {
  challenge: ChallengeInterface
  extraContent?: ReactNode
}

export function ChallengeCard({ challenge, extraContent }: ChallengeCardProps) {
  // Render using generic card with no primary action
  return <GenericChallengeCard challenge={challenge} primaryButton={null} showContributor={false} extraContent={extraContent} />
}