import { Skeleton } from "@/components/ui/skeleton";

export default function SolutionDetailsSkeleton() {
  return (
    <div>
      {/* Header Section Skeleton */}
      <div className="rounded-xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/30 dark:to-zinc-900/30 shadow-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-200 dark:border-slate-700 mb-8">
        <div className="space-y-2 w-full">
          <Skeleton className="h-6 w-2/3 mb-2" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-6">
        <div className="grid w-full grid-cols-2 rounded-xl bg-muted/40 p-1 mb-6">
          <Skeleton className="h-9 w-full rounded-lg mr-2" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>

      {/* Challenge Info Section Skeleton */}
      <div className="space-y-8">
        <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700 mb-8">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* Description Section Skeleton */}
        <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700 mb-8">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Solution Info Section Skeleton */}
        <div className="rounded-xl bg-white dark:bg-slate-900/60 shadow p-6 border border-slate-200 dark:border-slate-700">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}