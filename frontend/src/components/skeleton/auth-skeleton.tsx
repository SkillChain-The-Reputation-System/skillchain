import { Skeleton } from "../ui/skeleton";

export default function AuthSkeleton() {
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Skeleton className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex"></Skeleton>
    </div>
  );
}
