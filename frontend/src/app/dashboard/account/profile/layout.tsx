import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

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
      <div className="flex flex-col">
        <PageHeader
          title="Profile"
          description="View your profile information and your activity on SkillChain."
        ></PageHeader>

        <Separator className="my-6" />
        <div>{children}</div>
      </div>
    </div>
  );
}
