import { AccountPageHeader } from "@/components/layout/account-page-header";
import { Separator } from "@/components/ui/separator";
import { sidebarNavItemsProfileSettings } from "@/constants/data";
import { pageUrlMapping } from "@/constants/navigation";
import { SidebarNav } from "@/features/account/profile-settings/sidebar-nav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moderation | Settings",
  description: "Customize your moderation preferences including notification settings, preferred challenge categories, and personal moderation thresholds.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-4">
      <AccountPageHeader
        title="Moderation Settings"
        description="Customize your moderation preferences including notification settings, preferred challenge categories, and personal moderation thresholds."
      ></AccountPageHeader>

      <Separator className="my-6" />
      
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav items={sidebarNavItemsProfileSettings} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
