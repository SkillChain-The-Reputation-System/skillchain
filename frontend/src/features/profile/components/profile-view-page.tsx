"use client";

import PageContainer from "@/components/layout/page-container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import GeneralInfo from "./general-info";

export default function ProfileViewPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const username = null

  return (
    <PageContainer>
      <GeneralInfo username={username} address={address}></GeneralInfo>
    </PageContainer>
  );
}
