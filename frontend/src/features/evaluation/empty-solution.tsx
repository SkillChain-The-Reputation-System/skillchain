'use client'
// Import hooks
import { useRouter } from "next/navigation"

// Import UI components
import { Button } from "@/components/ui/button"

// Import lucide-react icons
import { FolderX } from "lucide-react"

// Import utils
import { pageUrlMapping } from "@/constants/navigation"

interface EmptySolutionProps {
  evaluationWorkspace?: boolean
}

export function EmptySolution({ evaluationWorkspace }: EmptySolutionProps) {
  const router = useRouter();

  const handleGoToPendingSolutions = () => {
    router.push(pageUrlMapping.evaluation_pendingsolutions);
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted/30 rounded-full p-4 mb-4">
        <FolderX className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">No pending solutions found</h3>

      {evaluationWorkspace ? (
        <>
          <p className="text-muted-foreground mb-6 max-w-md">
            You might have not joined any evaluation for a solution at the moment. Check back later or join now!
          </p>
          <Button className="cursor-pointer" onClick={handleGoToPendingSolutions}>Go to Explore Solutions</Button>
        </>
      ) : (
        <p className="text-muted-foreground mb-6 max-w-md">
          There are no solutions available at the moment. Please check back later.
        </p>
      )}
    </div>
  )
}