"use client";

import { Award, Tags } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobInterface } from "@/lib/interfaces";
import { DomainLabels } from "@/constants/system";

interface JobReputationCardProps {
  job: JobInterface;
}

export default function JobReputationCard({ job }: JobReputationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reputation Requirements</CardTitle>
      </CardHeader>
      <CardContent>
        {job.requireGlobalReputation ? (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-slate-500" />
              <span className="font-medium">Global Reputation</span>
            </div>
            <p className="text-sm text-slate-600 mb-2">
              Minimum score required:
              <span className="font-medium"> {job.globalReputationScore}/100</span>
            </p>
          </div>
        ) : (
          <p className="text-slate-600">No global reputation required</p>
        )}

        {job.domains &&
          job.domains.length > 0 &&
          job.domainReputations && (
            <>
              <Separator className="my-4" />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tags className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Domain Reputation</span>
                </div>
                <div className="space-y-2">
                  {job.domains.map((domain) => (
                    <div
                      key={`domain-${domain}`}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{DomainLabels[domain]}</span>
                      <Badge variant="outline">
                        {job.domainReputations[domain]}/100
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
      </CardContent>
    </Card>
  );
}
