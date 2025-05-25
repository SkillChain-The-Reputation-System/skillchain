"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { getUserProfileData } from "@/lib/get/get-user-data-utils";
import { getUserReputationScore } from "@/lib/get/get-reputation-score";
import {
  UserProfileInterface,
  UserReputationScoreInterface,
} from "@/lib/interfaces";

// Dynamic imports for better code splitting
const ProfileHeader = dynamic(() => import("./profile-header").then(mod => ({ default: mod.ProfileHeader })), {
  ssr: false,
});

const PersonalInformation = dynamic(() => import("./personal-information").then(mod => ({ default: mod.PersonalInformation })), {
  ssr: false,
});

const GlobalReputation = dynamic(() => import("./global-reputation").then(mod => ({ default: mod.GlobalReputation })), {
  ssr: false,
});

const DomainExpertise = dynamic(() => import("./domain-expertise").then(mod => ({ default: mod.DomainExpertise })), {
  ssr: false,
});

const NoWalletConnected = dynamic(() => import("./no-wallet-connected").then(mod => ({ default: mod.NoWalletConnected })), {
  ssr: false,
});

export default function ProfileViewPage() {
  const { address } = useAccount();
  const [profileData, setProfileData] = useState<UserProfileInterface | null>(
    null
  );
  const [reputationData, setReputationData] =
    useState<UserReputationScoreInterface | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingReputation, setIsLoadingReputation] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    if (!address) return;

    try {
      setIsLoadingProfile(true);
      const data = await getUserProfileData(address);
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Failed to load profile data");
      toast.error("Failed to load profile data");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchReputationScores = async () => {
    if (!address) return;

    try {
      setIsLoadingReputation(true);
      const data = await getUserReputationScore(address);
      setReputationData(data);
    } catch (error) {
      console.error("Error fetching reputation scores:", error);
      setError("Failed to load reputation scores");
      toast.error("Failed to load reputation scores");
    } finally {
      setIsLoadingReputation(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchUserProfile();
      fetchReputationScores();
    }
  }, [address]);

  const getReputationBadgeVariant = (
    score: number
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 60) return "default";
    if (score >= 40) return "secondary";
    if (score >= 20) return "outline";
    return "destructive";
  };

  if (!address) {
    return <NoWalletConnected />;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        profileData={profileData}
        reputationData={reputationData}
        isLoadingProfile={isLoadingProfile}
        isLoadingReputation={isLoadingReputation}
        address={address}
        getReputationBadgeVariant={getReputationBadgeVariant}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalInformation
            profileData={profileData}
            isLoadingProfile={isLoadingProfile}
          />
        </div>

        {/* Reputation Scores */}
        <div className="space-y-6">
          <GlobalReputation
            reputationData={reputationData}
            isLoadingReputation={isLoadingReputation}
          />

          <DomainExpertise
            reputationData={reputationData}
            isLoadingReputation={isLoadingReputation}
            getReputationBadgeVariant={getReputationBadgeVariant}
          />
        </div>
      </div>
    </div>
  );
}