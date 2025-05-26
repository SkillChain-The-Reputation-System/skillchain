"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, TrophyIcon } from "lucide-react";
import { JobApplicationWithJobDataInterface } from "@/lib/interfaces";
import { DomainLabels } from "@/constants/system";
import { DomainIconMap } from "@/constants/data";
import { Icons } from "@/components/icons";

interface QualificationsFitCardProps {
  application: JobApplicationWithJobDataInterface;
}

export default function QualificationsFitCard({
  application,
}: QualificationsFitCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Qualifications & Fit Assessment</CardTitle>
        <CardDescription>
          Evaluate the candidate's fit for this position
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Required Domains</h4>
            <div className="flex flex-wrap gap-2 mt-2 overflow-x-auto pb-2">
              {application.job.domains.map((domain) => {
                const userScore =
                  application.reputation_data?.domain_reputation?.[domain] || 0;
                const requiredScore =
                  application.job.domainReputations[domain] || 0;
                const meetsRequirement = userScore >= requiredScore;
                const iconName = DomainIconMap[domain];
                const DomainIcon = Icons[iconName as keyof typeof Icons];
                return (
                  <Badge
                    key={domain}
                    variant={meetsRequirement ? "default" : "destructive"}
                    className="whitespace-nowrap flex items-center gap-1 select-none"
                  >
                    {DomainIcon && <DomainIcon className="h-3 w-3" />}
                    {DomainLabels[domain]}
                    <span>
                      {userScore}/{requiredScore}
                    </span>
                    {meetsRequirement ? (
                      <CheckIcon className="h-3 w-3 ml-1 text-green-600" />
                    ) : (
                      <span className="text-red-600 ml-1">✗</span>
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>
          {application.job.requireGlobalReputation && (
            <div>
              <h4 className="font-medium">Global Reputation Requirement</h4>
              <div className="mt-2">
                {(() => {
                  const userGlobalRep =
                    application.reputation_data?.global_reputation || 0;
                  const requiredGlobalRep =
                    application.job.globalReputationScore || 0;
                  const meetsGlobalRequirement =
                    userGlobalRep >= requiredGlobalRep;

                  return (
                    <Badge
                      variant={
                        meetsGlobalRequirement ? "default" : "destructive"
                      }
                      className="whitespace-nowrap flex items-center gap-1 select-none"
                    >
                      <TrophyIcon className="h-3 w-3" />
                      <span>Global Reputation</span>
                      <span>
                        {userGlobalRep}/{requiredGlobalRep}
                      </span>
                      {meetsGlobalRequirement ? (
                        <CheckIcon className="h-3 w-3 ml-1 text-green-600" />
                      ) : (
                        <span className="text-red-600 ml-1">✗</span>
                      )}
                    </Badge>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
