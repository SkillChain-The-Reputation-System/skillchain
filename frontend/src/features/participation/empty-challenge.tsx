'use client'

import { FolderX } from "lucide-react"

// Emply page when there's no contributed challenges
export function EmptyChallenge() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted/30 rounded-full p-4 mb-4">
        <FolderX className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">No challenges found</h3>
      <p className="text-muted-foreground max-w-md">There are no challenges available at the moment.</p>
      <p className="text-muted-foreground max-w-md">Please check back later.</p>
    </div>
  )
}
