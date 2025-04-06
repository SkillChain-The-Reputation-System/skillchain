"use client";
import { useAccount } from "wagmi";
import GeneralInfo from "./general-info";
import { ContractConfig_UserDataManager } from "@/constants/contracts-config";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { readContract } from '@wagmi/core';
import { wagmiConfig } from "@/features/wallet/Web3Provider";


export default function ProfileViewPage() {
  const { address } = useAccount();
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [bio, setBio] = useState<string | undefined>(undefined);

  async function fetchUserData () {
    const username = await readContract(wagmiConfig, {
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: 'getUsername',
      args: [address],
    }) as string;

    const avatar = await readContract(wagmiConfig, {
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: 'getAvatar',
      args: [address],
    }) as string;

    const bio = await readContract(wagmiConfig, {
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: 'getBio',
      args: [address],
    }) as string;

    setUsername(username);
    setAvatar(avatar);
    setBio(bio);
  }

  console.log("address", address);
  console.log("username", username);
  console.log("avatar", avatar);

  // Fetch user data when the component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <>
      <GeneralInfo username={username} address={address} avatar={avatar} bio={bio}></GeneralInfo>
      <Button onClick={fetchUserData}> Refresh</Button>
    </>
  );
}
