"use client";
import { useAccount } from "wagmi";
import GeneralInfo from "./general-info";
import { useEffect, useState } from "react";
import { fetchStringDataOffChain } from "@/lib/fetching-offchain-data-utils";
import {
  fetchUserDataOnChain,
  fetchUserReputationScore,
} from "@/lib/fetching-onchain-data-utils";
import { toast } from "react-toastify";

export default function ProfileViewPage() {
  const { address } = useAccount();
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [bio, setBio] = useState<string | undefined>(undefined);
  const [globalReputation, setGlobalReputation] = useState<number | undefined>(
    undefined
  );
  const [domainReputation, setDomainReputation] = useState<
    number[] | undefined
  >(undefined);

  async function handleFetchingUserData() {
    await fetchUserDataOnChain(address as `0x${string}`)
      .then(async ({ username, avatar_url, bio_url }) => {
        if (bio_url && bio_url?.length > 0) {
          const bio = await fetchStringDataOffChain(bio_url);
          setBio(bio);
        }
        setUsername(username);
        setAvatar(avatar_url);
      })
      .catch((error) => {
        toast.error(`Error fetching user data: ${error.message}`);
      });
  }

  async function handleFetchingReputationScores() {
    await fetchUserReputationScore(address as `0x${string}`)
      .then((res) => {
        setGlobalReputation(res.global_reputation);
        setDomainReputation(res.domain_reputation);
      })
      .catch((error) => {
        toast.error(`Error fetching reputation scores: ${error.message}`);
      });
  }

  // Fetch user data when the component mounts
  useEffect(() => {
    if (address) {
      handleFetchingUserData();
      handleFetchingReputationScores();
    }
  }, [address]);

  return (
    <>
      <GeneralInfo
        username={username}
        address={address}
        avatar={avatar}
        bio={bio}
        global_reputation={globalReputation}
        domain_reputation={domainReputation}
      ></GeneralInfo>
    </>
  );
}
