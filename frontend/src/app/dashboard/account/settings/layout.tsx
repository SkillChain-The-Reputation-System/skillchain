import { Separator } from "@/components/ui/separator";
import { sidebarNavItemsProfileSettings } from "@/constants/data";
import { SidebarNav } from "@/features/profile-settings/components/sidebar-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="px-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        </div>
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