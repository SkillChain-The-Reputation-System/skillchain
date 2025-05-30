"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ChevronsUpDown, LogOut, User } from "lucide-react";
import { SidebarMenuButton } from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAccount, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getRecruiterProfileData } from "@/lib/get/get-recruiter-data-utils";
import { toast } from "react-toastify";
import { pageUrlMapping } from "@/constants/navigation";
import { recruiter_account_button_items } from "@/constants/data";
import { Icons } from "../icons";
import { useRecruiter } from "@/contexts/recruiter-context";

export const RecruiterAccountButton = () => {
  const [fullname, setFullname] = useState<string | undefined>(undefined);
  const [avatar_url, setAvatar] = useState<string | undefined>(undefined);
  const [company, setCompany] = useState<string | undefined>(undefined);
  const router = useRouter();
  
  const { address, isDisconnected, isReconnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { recruiterData } = useRecruiter();

  function handleDisconnectWallet() {
    disconnect();
    router.push(pageUrlMapping.home);
  }

  function handleDirectToPage(path: string) {
    router.push(path);
  }

  function handleSwitchToUser() {
    router.push(pageUrlMapping.dashboard);
  }

  // Update local state when context recruiterData changes
  useEffect(() => {
    if (recruiterData.fullname !== undefined) {
      setFullname(recruiterData.fullname);
    }
    if (recruiterData.avatar_url !== undefined) {
      setAvatar(recruiterData.avatar_url);
    }
    if (recruiterData.company !== undefined) {
      setCompany(recruiterData.company);
    }
  }, [recruiterData]);

  // Fetch recruiter data when the component mounts
  useEffect(() => {
    async function handleFetchingRecruiterData() {
      try {
        const recruiterProfile = await getRecruiterProfileData(address as `0x${string}`);
        if (recruiterProfile) {
          setFullname(recruiterProfile.recruiter_fullname);
          setAvatar(recruiterProfile.recruiter_avatar_url);
          setCompany(recruiterProfile.company_name);
        }
      } catch (error) {
        toast.error(`Error fetching recruiter data: ${error}`);
      }
    }

    if (address) {
      handleFetchingRecruiterData();
    }
  }, [address, isDisconnected, isReconnecting]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={avatar_url} alt={"Recruiter's avatar - SkillChain"} />
            <AvatarFallback className="rounded-lg">RC</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{fullname}</span>
            <span className="truncate text-xs">{company || address}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={avatar_url}
                alt={"Recruiter's avatar - SkillChain"}
              />
              <AvatarFallback className="rounded-lg">RC</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{fullname}</span>
              <span className="truncate text-xs">{company || address}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {recruiter_account_button_items.map((item) => {
            const IconComponent = item.icon
              ? Icons[item.icon as keyof typeof Icons]
              : Icons.logo;
            return (
              <DropdownMenuItem
                key={item.title}
                onClick={() => handleDirectToPage(item.href)}
              >
                <IconComponent />
                {item.title}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleSwitchToUser}>
            <User />
            Switch to User
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnectWallet}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
