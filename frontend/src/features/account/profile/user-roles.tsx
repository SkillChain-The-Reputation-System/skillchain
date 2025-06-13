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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getUserDomainRoleStatus,
  getRoleRequirementsByDomain,
} from "@/lib/get/get-user-role-data-utils";
import {
  DomainRoleStatusInterface,
  RoleRequirementsInterface,
} from "@/lib/interfaces";
import { Domain, DomainLabels } from "@/constants/system";
import { CheckCircle, Clock, Shield, XCircle } from "lucide-react";
import { toast } from "react-toastify";

interface UserRolesProps {
  address: `0x${string}` | undefined;
}

interface DomainRoleData {
  status: DomainRoleStatusInterface;
  requirements: RoleRequirementsInterface;
}

export function UserRoles({ address }: UserRolesProps) {
  const [roleData, setRoleData] = useState<Record<
    Domain,
    DomainRoleData
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!address) return;
      try {
        setIsLoading(true);
        const data: Record<Domain, DomainRoleData> = {} as Record<
          Domain,
          DomainRoleData
        >;
        await Promise.all(
          Object.values(Domain)
            .filter((d): d is Domain => typeof d === "number")
            .map(async (d) => {
              const [status, req] = await Promise.all([
                getUserDomainRoleStatus(address, d as Domain),
                getRoleRequirementsByDomain(d as Domain),
              ]);
              data[d as Domain] = { status, requirements: req };
            })
        );
        setRoleData(data);
      } catch (err) {
        console.error("Error fetching user roles:", err);
        setError("Failed to load role data");
        toast.error("Failed to load role data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, [address]);
  const getBadgeVariant = (has: boolean, can: boolean) => {
    // Achieved: User has the role - green success state
    if (has) return "achieved";

    // Eligible: User can gain the role but hasn't achieved it yet - gray neutral state
    if (can) return "eligible";

    // Ineligible: User cannot gain the role - muted red error state
    return "ineligible";
  };

  const getRoleIcon = (has: boolean, can: boolean) => {
    if (has) return <CheckCircle className="h-3 w-3" />;
    if (can) return <Clock className="h-3 w-3" />;
    return <XCircle className="h-3 w-3" />;
  };

  const getRoleStatus = (has: boolean, can: boolean) => {
    if (has) return "Achieved";
    if (can) return "Eligible";
    return "Ineligible";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Domain Roles
        </CardTitle>
        <CardDescription>Your role status in each domain</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : roleData ? (
          <div className="space-y-4">
            {Object.entries(DomainLabels).map(([key, label]) => {
              const domain = Number(key) as Domain;
              const info = roleData[domain];
              if (!info) return null;
              const { status, requirements } = info;
              return (
                <div key={domain} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{label}</span>
                    <Badge variant="secondary">Rep: {status.reputation}</Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant={getBadgeVariant(
                            status.is_contributor,
                            status.can_be_contributor
                          )}
                          className="flex items-center gap-1.5 cursor-help"
                        >
                          {getRoleIcon(
                            status.is_contributor,
                            status.can_be_contributor
                          )}
                          <span>Contributor</span>
                          <span className="text-xs opacity-75">
                            ({requirements.contributor_requirement})
                          </span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">
                          {getRoleStatus(
                            status.is_contributor,
                            status.can_be_contributor
                          )}
                        </p>
                        <p className="text-xs">
                          {status.is_contributor
                            ? "You have achieved this role"
                            : status.can_be_contributor
                            ? `You have ${status.reputation}/${requirements.contributor_requirement} reputation needed`
                            : `Need ${
                                requirements.contributor_requirement -
                                status.reputation
                              } more reputation`}
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant={getBadgeVariant(
                            status.is_evaluator,
                            status.can_be_evaluator
                          )}
                          className="flex items-center gap-1.5 cursor-help"
                        >
                          {getRoleIcon(
                            status.is_evaluator,
                            status.can_be_evaluator
                          )}
                          <span>Evaluator</span>
                          <span className="text-xs opacity-75">
                            ({requirements.evaluator_requirement})
                          </span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">
                          {getRoleStatus(
                            status.is_evaluator,
                            status.can_be_evaluator
                          )}
                        </p>
                        <p className="text-xs">
                          {status.is_evaluator
                            ? "You have achieved this role"
                            : status.can_be_evaluator
                            ? `You have ${status.reputation}/${requirements.evaluator_requirement} reputation needed`
                            : `Need ${
                                requirements.evaluator_requirement -
                                status.reputation
                              } more reputation`}
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant={getBadgeVariant(
                            status.is_moderator,
                            status.can_be_moderator
                          )}
                          className="flex items-center gap-1.5 cursor-help"
                        >
                          {getRoleIcon(
                            status.is_moderator,
                            status.can_be_moderator
                          )}
                          <span>Moderator</span>
                          <span className="text-xs opacity-75">
                            ({requirements.moderator_requirement})
                          </span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">
                          {getRoleStatus(
                            status.is_moderator,
                            status.can_be_moderator
                          )}
                        </p>
                        <p className="text-xs">
                          {status.is_moderator
                            ? "You have achieved this role"
                            : status.can_be_moderator
                            ? `You have ${status.reputation}/${requirements.moderator_requirement} reputation needed`
                            : `Need ${
                                requirements.moderator_requirement -
                                status.reputation
                              } more reputation`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No role data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
