import RoleRequirementBanner from "@/components/role-requirement-banner";
import { UserRole } from "@/constants/system";

export default function ContributionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <RoleRequirementBanner requiredRole={UserRole.CONTRIBUTOR} />
      {children}
    </div>
  );
}
