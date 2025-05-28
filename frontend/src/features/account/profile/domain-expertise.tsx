"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/icons";
import { UserReputationScoreInterface } from "@/lib/interfaces";
import { DomainLabels, Domain } from "@/constants/system";
import { DomainIconMap } from "@/constants/data";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DomainExpertiseProps {
  reputationData: UserReputationScoreInterface | null;
  isLoadingReputation: boolean;
  getReputationBadgeVariant: (score: number) => "default" | "secondary" | "destructive" | "outline";
}

export function DomainExpertise({
  reputationData,
  isLoadingReputation,
  getReputationBadgeVariant,
}: DomainExpertiseProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Domain Expertise
        </CardTitle>
        <CardDescription>
          Your reputation in different skill domains
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingReputation ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        ) : reputationData ? (
          <div className="space-y-3">
            {Object.entries(DomainLabels).map(
              ([domainKey, domainLabel]) => {
                const domain = Number(domainKey) as Domain;
                const score =
                  reputationData.domain_reputation[domain] || 0;
                const iconName = DomainIconMap[domain];
                const IconComponent =
                  Icons[iconName as keyof typeof Icons];

                return (
                  <div
                    key={domain}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {IconComponent && (
                        <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span
                        className="text-sm font-medium truncate"
                        title={domainLabel}
                      >
                        {domainLabel}
                      </span>
                    </div>
                    <div className="relative">
                      <Badge
                        variant={getReputationBadgeVariant(score)}
                        className={cn(
                          "font-bold min-w-12 justify-center relative overflow-hidden",
                          "bg-gradient-to-r shadow-lg transition-all duration-300 hover:scale-105",
                          score >= 80 &&
                            "from-emerald-500 to-green-500 text-white shadow-green-500/30",
                          score >= 60 &&
                            score < 80 &&
                            "from-blue-500 to-cyan-500 text-white shadow-blue-500/30",
                          score >= 40 &&
                            score < 60 &&
                            "from-yellow-500 to-orange-500 text-white shadow-yellow-500/30",
                          score >= 20 &&
                            score < 40 &&
                            "from-orange-500 to-red-500 text-white shadow-orange-500/30",
                          score < 20 &&
                            "from-red-500 to-pink-500 text-white shadow-red-500/30"
                        )}
                      >
                        <span className="relative z-10 font-extrabold text-sm">
                          {score}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50" />
                      </Badge>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No domain reputation data found
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
