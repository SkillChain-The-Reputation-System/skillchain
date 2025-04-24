import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ChallengeSkeleton() {
  return (
    <Card className="w-full overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-2 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex items-center justify-center">
          <Skeleton className="h-5 w-32" />
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex items-center">
        <Skeleton className="h-4 w-36" />
      </CardFooter>
    </Card>
  )
}
