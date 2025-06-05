import RoleRequirementBanner from "@/components/role-requirement-banner";
import { UserRole } from "@/constants/system";

export default function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <RoleRequirementBanner requiredRole={UserRole.MODERATOR} />
      {children}
    </div>
  );
}
