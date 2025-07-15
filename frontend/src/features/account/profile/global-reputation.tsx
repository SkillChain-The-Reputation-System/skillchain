"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserReputationScoreInterface } from "@/lib/interfaces";
import { Award, Star } from "lucide-react";

interface GlobalReputationProps {
  reputationData: UserReputationScoreInterface | null;
  isLoadingReputation: boolean;
}

export function GlobalReputation({
  reputationData,
  isLoadingReputation,
}: GlobalReputationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Global Reputation
        </CardTitle>
        <CardDescription>Your overall reputation score</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingReputation ? (
          <div className="text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        ) : reputationData ? (
          <div className="text-center">
            <div className="relative">
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {reputationData.global_reputation}
                </span>
              </div>
              <Star className="absolute -top-1 -right-1 h-6 w-6 text-primary fill-current" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Global Reputation Score
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No reputation data found
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
