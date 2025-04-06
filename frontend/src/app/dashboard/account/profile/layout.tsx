import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    <div>
      <div className="flex flex-col px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">
              Manage your profile settings and preferences.
            </p>
          </div>
          <Link
            href="/dashboard/account/settings"
            className={cn(buttonVariants(), "text-xs md:text-sm")}
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </div>
        <Separator className="my-6" />
      </div>
      <PageContainer>{children}</PageContainer>
    </div>
  );
}
