'use client'

import { FolderX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyChallengeProps {
  onCreateNew?: () => void
}

export function EmptyChallenge({ onCreateNew }: EmptyChallengeProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted/30 rounded-full p-4 mb-4">
        <FolderX className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium mb-2">No challenges found</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        There are no challenges available at the moment. Check back later or contribute a new challenge.
      </p>
      {onCreateNew && <Button onClick={onCreateNew}>Contribute New Challenge</Button>}
    </div>
  )
}
