import { AccountPageHeader } from "@/components/layout/account-page-header";
import PageContainer from "@/components/layout/page-container";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { pageUrlMapping } from "@/constants/navigation";

export const metadata: Metadata = {
  title: "Moderation | Summary",
  description: "Track your moderation activity history, view decisions, and analyze your moderation statistics such as agreement rate and most-reviewed categories.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-col px-4">
        <AccountPageHeader
          title="Moderation Summary"
          description="Track moderation activity history, view decisions, and analyze moderation statistics."
        ></AccountPageHeader>

        <Separator className="my-6" />
      </div>
      
      <PageContainer>{children}</PageContainer>
    </div>
  );
}
