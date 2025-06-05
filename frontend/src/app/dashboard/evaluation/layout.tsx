import RoleRequirementBanner from "@/components/role-requirement-banner";
import { UserRole } from "@/constants/system";

export default function EvaluationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <RoleRequirementBanner requiredRole={UserRole.EVALUATOR} />
      {children}
    </div>
  );
}
