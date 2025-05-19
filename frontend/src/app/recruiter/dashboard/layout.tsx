import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Recruiter | Dashboard",
  description: "Overview and analytics for recruiters.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col px-4">
      <PageHeader
        title="Recruiter Dashboard"
        description="Welcome back! Here's an overview of your recruitment activities."
      />
      <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
