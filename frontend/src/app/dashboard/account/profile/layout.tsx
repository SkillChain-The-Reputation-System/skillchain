import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Profile",
  description: "Profile page",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="self-end px-4">
        <Link
          href="/dashboard/account/settings"
          className={cn(buttonVariants(), "text-xs md:text-sm")}
        >
          <Settings className="h-4 w-4" /> Settings
        </Link>
      </div>
      <div>{children}</div>
    </div>
  );
}
