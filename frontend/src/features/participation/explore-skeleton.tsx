// Import UI components
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Contributed challenges skeleton display when loading data
export function ExploreSkeleton() {
  return (
    <Card className="w-full overflow-hidden h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-2 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-center">
          <Skeleton className="h-5 w-32" />
        </div>
      </CardContent>

      <CardFooter>
        <Skeleton className="h-4 w-36" />
      </CardFooter>
    </Card>
  )
}
