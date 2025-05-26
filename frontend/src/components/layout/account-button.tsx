"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ChevronsUpDown, LogOut, User, UserSearch } from "lucide-react";
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
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getUserProfileData } from "@/lib/get/get-user-data-utils";
import { toast } from "react-toastify";
import { pageUrlMapping } from "@/constants/navigation";
import { account_button_items } from "@/constants/data";
import { recruiter_account_button_items } from "@/constants/data";
import { Icons } from "../icons";
import { useUser } from "@/contexts/user-context";

export const AccountButton = () => {
  const [fullname, setFullname] = useState<string | undefined>(undefined);
  const [avatar_url, setAvatar] = useState<string | undefined>(undefined);
  const [isRecruiter, setIsRecruiter] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const { address, isDisconnected, isReconnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { userData } = useUser();

  function handleDisconnectWallet() {
    disconnect();
    router.push(pageUrlMapping.home);
  }

  function handleDirectToPage(path: string) {
    router.push(path);
  }
  // Update recruiter status when pathname changes
  useEffect(() => {
    setIsRecruiter(pathname.startsWith("/recruiter"));
  }, [pathname]);

  // Update local state when context userData changes
  useEffect(() => {
    // Remove debug toasts - only update silently
    if (userData.fullname !== undefined) {
      setFullname(userData.fullname);
    }
    if (userData.avatar_url !== undefined) {
      setAvatar(userData.avatar_url);
    }
  }, [userData]);

  // Fetch user data when the component mounts
  useEffect(() => {
    async function handleFetchingUserData() {
      try {
        const userProfile = await getUserProfileData(address as `0x${string}`);
        if (userProfile) {
          setFullname(userProfile.fullname);
          setAvatar(userProfile.avatar_url);
        }
      } catch (error) {
        toast.error(`Error fetching user data: ${error}`);
      }
    }

    if (address) {
      handleFetchingUserData();
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
            <AvatarImage src={avatar_url} alt={"User's avartar - SkillChain"} />
            <AvatarFallback className="rounded-lg">SK</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{fullname}</span>
            <span className="truncate text-xs">{address}</span>
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
                alt={"User's avartar - SkillChain"}
              />
              <AvatarFallback className="rounded-lg">SK</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{fullname}</span>
              <span className="truncate text-xs">{address}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {isRecruiter
            ? // Display recruiter menu items
              recruiter_account_button_items.map((item) => {
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
              })
            : // Display regular user menu items
              account_button_items.map((item) => {
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

        {isRecruiter ? (
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                setIsRecruiter(false);
                handleDirectToPage(pageUrlMapping.dashboard);
              }}
            >
              <User />
              Switch to User
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                setIsRecruiter(true);
                handleDirectToPage(pageUrlMapping.recruiter_dashboard);
              }}
            >
              <UserSearch />
              Switch to Recruiter
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnectWallet}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
