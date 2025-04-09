import { AccountPageHeader } from "@/components/layout/account-page-header";
import PageContainer from "@/components/layout/page-container";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { pageUrlMapping } from "@/constants/navigation";

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
        <AccountPageHeader
          title="Profile"
          description="View your profile information and your activity on SkillChain."
          includeButton={true}
          buttonLink={pageUrlMapping.settings}
          buttonIcon={<Settings className="mr-2 h-4 w-4" />}
          buttonTitle="Settings"
        ></AccountPageHeader>

        <Separator className="my-6" />
      </div>
      
      <PageContainer>{children}</PageContainer>
    </div>
  );
}
