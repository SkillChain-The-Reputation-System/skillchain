import RecruiterSidebar from "@/components/layout/recruiter-sidebar";
import Header from "@/components/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RecruiterProvider } from "@/contexts/recruiter-context";
import RecruiterRequirementBanner from "@/components/recruiter-requirement-banner";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "SkillChain Recruiter",
  description: "Recruiter Portal of SkillChain system",
};

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"; return (
    <RecruiterProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <RecruiterSidebar />
        <SidebarInset>
          <div className="px-4">
            <Header />
            <RecruiterRequirementBanner />
            {/* page main content */}
            <div className="py-4">{children}</div>

            {/* page main content ends */}
          </div>

        </SidebarInset>
      </SidebarProvider>
    </RecruiterProvider>
  );
}


