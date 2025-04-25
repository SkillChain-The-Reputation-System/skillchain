'use client'

// Import hooks
import { useState } from "react"

// Import UI components
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

// Import Lucide-react Icons
import { Calendar, Tag, ArrowUpRight, Clock, Users } from "lucide-react"

// Import utils
import { cn } from "@/lib/utils"
import { ChallengeInterface, ChallengeCategory, ChallengeCategoryLabels } from "@/lib/interfaces";

interface ChallengeCardProps {
  challenge: ChallengeInterface
}

// Format as US date from Date object
function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const formattedContributeDate = formatDate(new Date(Number(challenge.contributeAt)));

  // Styles of status badge (light and dark mode)
  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/30",
    Approved: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/30",
    Rejected: "bg-red-100 text-red-800 hover:bg-red-100 dark:text-red-200 dark:hover:bg-red-900/30",
  }

  return (
    <>
      <Card className="w-full overflow-hidden bg-blue-100 dark:bg-blue-950/60 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg dark:hover:shadow-blue-900/20 border-transparent hover:border-blue-300 dark:hover:border-blue-700 h-full cursor-pointer group"
        onClick={() => setShowDetails(true)}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{challenge.title}</CardTitle>
            <Badge className={cn("ml-2 font-normal capitalize", statusStyles[challenge.status as keyof typeof statusStyles])}>
              {challenge.status}
            </Badge>
          </div>
          <div className="line-clamp-2 mt-1 text-muted-foreground text-sm" dangerouslySetInnerHTML={{ __html: challenge.description || "" }}></div>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            <span>Category:</span>
            <Badge variant="outline" className="ml-1 font-normal border-black dark:border-blue-700">
              {ChallengeCategoryLabels[challenge.category as ChallengeCategory]}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="pt-2 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Created on {formattedContributeDate}
          </div>
          <div className="flex items-center text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="mr-1">Details</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </CardFooter>
      </Card >

      {/* Dialog pop ups when user click on challenge card */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between mt-3.5">
              <DialogTitle className="text-2xl">{challenge.title}</DialogTitle>
              <Badge className={cn("font-normal capitalize", statusStyles[challenge.status as keyof typeof statusStyles])}>{challenge.status}</Badge>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Category</span>
              <Badge variant="outline" className="w-fit">
                {ChallengeCategoryLabels[challenge.category as ChallengeCategory]}
              </Badge>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Contribution fee</span>
              <span>0 ETHs</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Created On</span>
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>{formattedContributeDate}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Expected verification date</span>
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>Feb 31, 2077</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Participants</span>
              <div className="flex items-center">
                <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>0 enrolled</span>
              </div>
            </div>
          </div>

          {challenge.description && (
            <>
              <Separator />
              <div className="py-4">
                <h3 className="font-medium mb-2">Challenge Details</h3>
                <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: challenge.description }}></div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            {/* <Button>Edit</Button> */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}