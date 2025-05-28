import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-4">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences."
        includeButton={false}
      ></PageHeader>

      <Separator className="my-6" />

      <div className="flex-1">{children}</div>
    </div>
  );
}
