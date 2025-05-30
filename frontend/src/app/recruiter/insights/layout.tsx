import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Recruiter | Insights",
  description: "View insights and reports for recruiter activities.",
};

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col px-4">
      <PageHeader
        title="Recruitment Insights"
        description="Analytics and insights about your recruitment process."
      />
      <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
