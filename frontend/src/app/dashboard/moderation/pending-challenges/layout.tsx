import { AccountPageHeader } from "@/components/layout/account-page-header";
import PageContainer from "@/components/layout/page-container";
import { Separator } from "@/components/ui/separator";
import { ShieldUser } from "lucide-react";
import type { Metadata } from "next";
import { pageUrlMapping } from "@/constants/navigation";
import { SidebarNav } from "@/features/profile-settings/components/sidebar-nav";
import { sidebarNavItemsProfileSettings } from "@/constants/data";

export const metadata: Metadata = {
  title: "Moderation | Pending Challenges",
  description:
    "Browse and manage all newly submitted challenges awaiting review by moderators.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col px-4">
      <AccountPageHeader
        title="Pending Challenges"
        description="Browse and manage all newly submitted challenges awaiting review by moderators."
        includeButton={true}
        buttonLink={pageUrlMapping.moderation_reviewchallenges}
        buttonIcon={<ShieldUser className="h-4 w-4" />}
        buttonTitle="Review Challenges"
      ></AccountPageHeader>

      <Separator className="my-6" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
