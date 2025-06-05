"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { UserRole, UserRoleLabels } from "@/constants/system";
import { getUserRoleStatus, getAllRoleRequirements } from "@/lib/get/get-user-role-data-utils";

interface RoleRequirementBannerProps {
  requiredRole: UserRole;
}

export default function RoleRequirementBanner({ requiredRole }: RoleRequirementBannerProps) {
  const { address } = useAccount();
  const [show, setShow] = useState(false);
  const [requirement, setRequirement] = useState<number | null>(null);
  const [currentRep, setCurrentRep] = useState<number | null>(null);

  useEffect(() => {
    const check = async () => {
      if (!address) return;
      try {
        const [status, requirements] = await Promise.all([
          getUserRoleStatus(address),
          getAllRoleRequirements(),
        ]);
        let can = false;
        let has = false;
        let req = 0;
        switch (requiredRole) {
          case UserRole.CONTRIBUTOR:
            can = status.can_be_contributor;
            has = status.is_contributor;
            req = requirements.contributor_requirement;
            break;
          case UserRole.EVALUATOR:
            can = status.can_be_evaluator;
            has = status.is_evaluator;
            req = requirements.evaluator_requirement;
            break;
          case UserRole.MODERATOR:
            can = status.can_be_moderator;
            has = status.is_moderator;
            req = requirements.moderator_requirement;
            break;
        }
        setRequirement(req);
        setCurrentRep(status.reputation);
        if (!has && !can) {
          setShow(true);
        } else {
          setShow(false);
        }
      } catch (err) {
        console.error(err);
      }
    };
    check();
  }, [address, requiredRole]);

  if (!show) return null;
  return (
    <Alert 
      variant="destructive" 
      className="rounded-none py-2 mb-4 border-red-500 bg-red-50 dark:bg-red-950/50 dark:border-red-400 border-l-4 border-l-red-600 dark:border-l-red-400"
    >
      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
        You need at least {requirement ?? 0} reputation to access {UserRoleLabels[requiredRole]} features. You currently have {currentRep ?? 0}.
      </AlertDescription>
    </Alert>
  );
}
