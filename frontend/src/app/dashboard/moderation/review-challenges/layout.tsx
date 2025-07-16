import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

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
      <div className="flex flex-col"><PageHeader
          title="Review Challenge"
          description="Inspect full challenge details, assign difficulty and quality ratings, add comments, and cast moderation vote for approval, rejection, or revision."
        ></PageHeader>

        <Separator className="my-6" />
        <div className="flex-1">{children}</div>
      </div>
  
    </div>
  );
}
