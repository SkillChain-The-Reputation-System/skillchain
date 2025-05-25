import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";
import { sidebarNavItemsProfileSettings } from "@/constants/data";
import { pageUrlMapping } from "@/constants/navigation";
import { SidebarNav } from "@/features/account/profile-settings/sidebar-nav";

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

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav items={sidebarNavItemsProfileSettings} />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
