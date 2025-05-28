"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobApplicationWithJobDataInterface } from "@/lib/interfaces";
import { DomainLabels } from "@/constants/system";

interface ApplicantProfileCardProps {
  application: JobApplicationWithJobDataInterface;
}

export default function ApplicantProfileCard({
  application,
}: ApplicantProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Applicant Profile</CardTitle>
        <CardDescription>Personal and reputation data</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24">
          <AvatarImage
            src={application.profile_data?.avatar_url || ""}
            alt={application.profile_data?.fullname || "Applicant"}
          />
          <AvatarFallback>
            {application.profile_data?.fullname
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "AP"}
          </AvatarFallback>
        </Avatar>
        <div className="text-center max-w-full">
          <h3 className="text-xl font-semibold">
            {application.profile_data?.fullname || "Unknown Name"}
          </h3>
          <div className="text-sm text-muted-foreground truncate">
            {application.profile_data?.email || "No email available"}
          </div>
          {application.profile_data?.location && (
            <div className="text-sm text-muted-foreground">
              {application.profile_data.location}
            </div>
          )}
        </div>
        <Separator className="my-4" />
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-sm font-medium text-muted-foreground">Global Reputation:</span>
            <Badge variant="secondary">
              {application.reputation_data?.global_reputation || 0}
            </Badge>
          </div>
          {/* Domain reputation for job-required domains */}
          {application.job?.domains && application.job.domains.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Domain Reputation:
              </div>
              {application.job.domains.map((domain) => (
                <div key={domain} className="flex justify-between text-sm">
                  <span className="text-xs">{DomainLabels[domain]}:</span>
                  <Badge variant="secondary" className="text-xs">
                    {application.reputation_data?.domain_reputation?.[domain] || 0}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
