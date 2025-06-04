"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getUserRoleStatus,
  getAllRoleRequirements,
} from "@/lib/get/get-user-role-data-utils";
import {
  UserRoleStatusInterface,
  RoleRequirementsInterface,
} from "@/lib/interfaces";
import { UserRole, UserRoleLabels } from "@/constants/system";
import { Shield, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "react-toastify";

interface UserRolesProps {
  address: `0x${string}` | undefined;
}

export function UserRoles({ address }: UserRolesProps) {
  const [roleData, setRoleData] = useState<UserRoleStatusInterface | null>(
    null
  );
  const [roleRequirements, setRoleRequirements] =
    useState<RoleRequirementsInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchUserRoles = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);
      const [roleStatusData, requirementsData] = await Promise.all([
        getUserRoleStatus(address),
        getAllRoleRequirements(),
      ]);
      setRoleData(roleStatusData);
      setRoleRequirements(requirementsData);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      setError("Failed to load role data");
      toast.error("Failed to load role data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchUserRoles();
    }
  }, [address]);

  const getRoleStatus = (
    role: UserRole
  ): "active" | "eligible" | "inactive" => {
    if (!roleData) return "inactive";

    switch (role) {
      case UserRole.CONTRIBUTOR:
        return roleData.is_contributor
          ? "active"
          : roleData.can_be_contributor
          ? "eligible"
          : "inactive";
      case UserRole.EVALUATOR:
        return roleData.is_evaluator
          ? "active"
          : roleData.can_be_evaluator
          ? "eligible"
          : "inactive";
      case UserRole.MODERATOR:
        return roleData.is_moderator
          ? "active"
          : roleData.can_be_moderator
          ? "eligible"
          : "inactive";
      case UserRole.NORMAL_USER:
        return "active"; // All users are normal users by default
      default:
        return "inactive";
    }
  };

  const getRoleRequirement = (role: UserRole): number | null => {
    if (!roleRequirements) return null;

    switch (role) {
      case UserRole.CONTRIBUTOR:
        return roleRequirements.contributor_requirement;
      case UserRole.EVALUATOR:
        return roleRequirements.evaluator_requirement;
      case UserRole.MODERATOR:
        return roleRequirements.moderator_requirement;
      case UserRole.NORMAL_USER:
        return 0; // Normal users have no reputation requirement
      default:
        return null;
    }
  };

  const getRoleBadgeVariant = (status: "active" | "eligible" | "inactive") => {
    switch (status) {
      case "active":
        return "default";
      case "eligible":
        return "secondary";
      case "inactive":
        return "outline";
    }
  };

  const getRoleStatusColor = (status: "active" | "eligible" | "inactive") => {
    switch (status) {
      case "active":
        return "text-green-700 dark:text-green-400";
      case "eligible":
        return "text-blue-700 dark:text-blue-400";
      case "inactive":
        return "text-gray-500 dark:text-gray-400";
    }
  };
  const getRoleBorderColor = (status: "active" | "eligible" | "inactive") => {
    switch (status) {
      case "active":
        return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 hover:border-green-300 hover:bg-green-100 dark:hover:border-green-700 dark:hover:bg-green-950/40";
      case "eligible":
        return "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 hover:border-blue-300 hover:bg-blue-100 dark:hover:border-blue-700 dark:hover:bg-blue-950/40";
      case "inactive":
        return "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/20 hover:border-gray-300 hover:bg-gray-100 dark:hover:border-gray-600 dark:hover:bg-gray-950/40";
    }
  };
  const getRoleIcon = (status: "active" | "eligible" | "inactive") => {
    switch (status) {
      case "active":
        return (
          <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
        );
      case "eligible":
        return <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
      case "inactive":
        return <XCircle className="h-3 w-3 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusText = (status: "active" | "eligible" | "inactive") => {
    switch (status) {
      case "active":
        return "Active";
      case "eligible":
        return "Eligible";
      case "inactive":
        return "Not Available";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Roles & Permissions
        </CardTitle>
        <CardDescription>
          Your current roles and eligibility status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : roleData ? (
          <div className="space-y-4">
            {/* Role Status List */}
            <div className="space-y-3">
              {Object.values(UserRole)
                .filter((role): role is UserRole => typeof role === "number")
                .map((role) => {
                  const status = getRoleStatus(role);
                  return (
                    <div
                      key={role}
                      className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 cursor-pointer ${getRoleBorderColor(
                        status
                      )}`}
                    >
                      <div className="flex items-center gap-3">
                        {getRoleIcon(status)}
                        <div>
                          <p className="font-medium text-sm">
                            {UserRoleLabels[role]}
                          </p>
                          <p
                            className={`text-xs ${getRoleStatusColor(status)}`}
                          >
                            {getStatusText(status)}
                          </p>
                          {/* Show reputation requirement */}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(() => {
                              const requirement = getRoleRequirement(role);
                              if (requirement === null || requirement === 0) {
                                return "No reputation required";
                              }
                              return `Global reputation required: ${requirement}`;
                            })()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={getRoleBadgeVariant(status)}
                        className={
                          status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700"
                            : status === "eligible"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                        }
                      >
                        {getStatusText(status)}
                      </Badge>
                    </div>
                  );
                })}
            </div>

            {/* Role Requirements Info */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Role eligibility is based on your
                reputation score and system requirements. Higher reputation
                unlocks additional roles and permissions.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No role data available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
