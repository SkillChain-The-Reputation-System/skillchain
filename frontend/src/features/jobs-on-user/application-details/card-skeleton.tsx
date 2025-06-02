export default function CardSkeleton() {
  return (
    <div className="border rounded-xl py-6 shadow-sm space-y-4">
      <div className="px-6 flex gap-2">
        <div className="h-6 w-6 rounded-md bg-slate-200 animate-pulse"></div>
        <div className="h-6 w-36 rounded-md bg-slate-200 animate-pulse"></div>
      </div>
      <div className="px-6">
        <div className="h-24 bg-slate-200 animate-pulse rounded-lg"></div>
      </div>
    </div>
  );
}
