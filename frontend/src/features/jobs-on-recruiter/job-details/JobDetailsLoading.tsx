"use client";

export default function JobDetailsLoading() {
  return (
    <div className="flex flex-col px-4 space-y-8">
      <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-md" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-32 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-64 bg-slate-200 animate-pulse rounded-lg" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-32 bg-slate-200 animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
}
