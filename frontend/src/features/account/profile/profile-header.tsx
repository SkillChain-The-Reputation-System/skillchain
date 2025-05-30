"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfileInterface, UserReputationScoreInterface } from "@/lib/interfaces";
import { Mail, MapPin, Trophy, Shield } from "lucide-react";

interface ProfileHeaderProps {
  profileData: UserProfileInterface | null;
  reputationData: UserReputationScoreInterface | null;
  isLoadingProfile: boolean;
  isLoadingReputation: boolean;
  address: string;
  getReputationBadgeVariant: (score: number) => "default" | "secondary" | "destructive" | "outline";
}

export function ProfileHeader({
  profileData,
  reputationData,
  isLoadingProfile,
  isLoadingReputation,
  address,
  getReputationBadgeVariant,
}: ProfileHeaderProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-10" />
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            {isLoadingProfile ? (
              <Skeleton className="h-24 w-24 rounded-full" />
            ) : (
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage
                  src={profileData?.avatar_url}
                  alt={profileData?.fullname || "User avatar"}
                />
                <AvatarFallback className="text-2xl font-bold">
                  {profileData?.fullname
                    ? profileData.fullname.slice(0, 2).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              {isLoadingProfile ? (
                <>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {profileData?.fullname || "Anonymous User"}
                  </h1>
                  <p className="text-sm text-muted-foreground font-mono break-all">
                    {address}
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              {isLoadingProfile ? (
                <>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </>
              ) : (
                <>
                  {profileData?.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                  {profileData?.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{profileData.email}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {!isLoadingReputation && reputationData && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">Global Reputation:</span>
                  <Badge
                    variant={getReputationBadgeVariant(
                      reputationData.global_reputation
                    )}
                    className="font-bold"
                  >
                    {reputationData.global_reputation}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
