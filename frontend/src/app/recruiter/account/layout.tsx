import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Recruiter | Account",
  description: "Manage your recruiter account settings and profile.",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Account"
        description="Manage your recruiter account settings."
      />
      <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
