import { PageHeader } from "@/components/layout/page-header";
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
        <PageHeader
          title="Profile"
          description="View your profile information and your activity on SkillChain."
        ></PageHeader>

        <Separator className="my-6" />
      </div>

      <PageContainer>{children}</PageContainer>
    </div>
  );
}
