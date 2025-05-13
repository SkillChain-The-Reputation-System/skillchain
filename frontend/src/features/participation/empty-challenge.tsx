'use client'
// Import hooks
import { useRouter } from "next/navigation"

// Import UI components
import { Button } from "@/components/ui/button"

// Import lucide-react icons
import { FolderX } from "lucide-react"

// Import utils
import { pageUrlMapping } from "@/constants/navigation"

interface EmptyChallengeProps {
  workSpacePreview?: boolean
}

export function EmptyChallenge({ workSpacePreview }: EmptyChallengeProps) {
  const router = useRouter();

  const handleGoToExplore = () => {
    router.push(pageUrlMapping.participation_explore);
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted/30 rounded-full p-4 mb-4">
        <FolderX className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">No challenges found</h3>

      {workSpacePreview ? (
        <>
          <p className="text-muted-foreground mb-6 max-w-md">
            You might have not joined any challenge at the moment. Check back later or join a new challenge now!
          </p>
          <Button className="cursor-pointer" onClick={handleGoToExplore}>Go to Explore</Button>
        </>
      ) : (
        <p className="text-muted-foreground mb-6 max-w-md">
          There are no challenges available at the moment. Please check back later.
        </p>
      )}
    </div>
  )
}
