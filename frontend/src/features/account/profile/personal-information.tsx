"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UserProfileInterface } from "@/lib/interfaces";
import { User, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface PersonalInformationProps {
  profileData: UserProfileInterface | null;
  isLoadingProfile: boolean;
}

export function PersonalInformation({
  profileData,
  isLoadingProfile,
}: PersonalInformationProps) {
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const bioText = profileData?.bio || "No biography provided";
  const isLongBio = bioText.length > 200;
  const displayBio =
    isLongBio && !isBioExpanded ? bioText.substring(0, 200) + "..." : bioText;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Your profile details and contact information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingProfile ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : profileData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Full Name
                </label>
                <p className="text-sm font-medium">
                  {profileData.fullname || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-sm font-medium">
                  {profileData.email || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Location
                </label>
                <p className="text-sm font-medium">
                  {profileData.location || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Wallet Address
                </label>
                <p className="text-sm font-mono text-muted-foreground break-all">
                  {profileData.address}
                </p>
              </div>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Biography
              </label>
              <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {displayBio}
                </p>
                {isLongBio && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsBioExpanded(!isBioExpanded)}
                    className="mt-2 h-auto p-0 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent dark:hover:bg-transparent"
                  >
                    <span className="flex items-center gap-1 cursor-pointer">
                      {isBioExpanded ? (
                        <>
                          Show less <ChevronUp className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          Show more <ChevronDown className="h-3 w-3" />
                        </>
                      )}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No profile data found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
