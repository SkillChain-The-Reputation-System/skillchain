import { AccountPageHeader } from "@/components/layout/account-page-header";
import PageContainer from "@/components/layout/page-container";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { pageUrlMapping } from "@/constants/navigation";

export const metadata: Metadata = {
  title: "Moderation | Review Challenge",
  description: "Inspect full challenge details, assign difficulty and quality ratings, add comments, and cast moderation vote for approval, rejection, or revision.",
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
          title="Review Challenge"
          description="Inspect full challenge details, assign difficulty and quality ratings, add comments, and cast moderation vote for approval, rejection, or revision."
        ></AccountPageHeader>

        <Separator className="my-6" />
        <div className="flex-1">{children}</div>
      </div>
  
    </div>
  );
}
