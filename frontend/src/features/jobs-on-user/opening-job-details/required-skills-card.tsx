"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle } from "lucide-react";
import { JobInterface } from "@/lib/interfaces";
import { Domain, DomainLabels } from "@/constants/system";

interface RequiredSkillsCardProps {
  job: JobInterface;
}

export default function RequiredSkillsCard({ job }: RequiredSkillsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Required Skills
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {job.requireGlobalReputation && (
            <div className="mb-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Global Reputation Required</span>
              </div>
              <span className="text-sm text-slate-600">
                Minimum Score: {job.globalReputationScore}/100
              </span>
            </div>
          )}
          {job.domains && job.domains.length > 0 ? (
            job.domains.map((domain) => (
              <div key={domain} className="flex flex-col">
                <Badge variant="secondary" className="mb-2 self-start">
                  {DomainLabels[domain as Domain]}
                </Badge>
                {job.domainReputations &&
                  job.domainReputations[domain as Domain] >= 0 && (
                    <span className="text-sm text-slate-600">
                      Min Score: {job.domainReputations[domain as Domain]}/100
                    </span>
                  )}
              </div>
            ))
          ) : (
            <span className="text-slate-500 italic">
              No specific domains required.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
