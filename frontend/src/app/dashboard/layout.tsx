import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserProvider } from "@/contexts/user-context";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "SkillChain Starter",
  description: "Dashboard of SkillChain system",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  return (
    <UserProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <div className="px-4">
            <Header />
            {/* page main content */}
            <div className="py-4">{children}</div>
          </div>
          {/* page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
