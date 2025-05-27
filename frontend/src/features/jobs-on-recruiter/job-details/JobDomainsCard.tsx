"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobInterface } from "@/lib/interfaces";
import { DomainLabels } from "@/constants/system";

interface JobDomainsCardProps {
  job: JobInterface;
}

export default function JobDomainsCard({ job }: JobDomainsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Expertise</CardTitle>
        <CardDescription>
          Required skills and expertise for this position
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {job.domains && job.domains.length > 0 ? (
            job.domains.map((domain) => (
              <div
                key={domain}
                className="flex flex-col items-center p-3 border rounded-lg"
              >
                <Badge variant="secondary" className="mb-2">
                  {DomainLabels[domain]}
                </Badge>
                {job.domainReputations ? (
                  <span className="text-sm text-slate-600">
                    Min Score: {job.domainReputations[domain]}
                  </span>
                ) : null}
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
