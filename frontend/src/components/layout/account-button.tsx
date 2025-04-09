"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
} from "lucide-react";
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
import { useEffect, useState } from "react";
import { fetchUserDataOnChain } from "@/lib/fetching-onchain-data-utils";
import { toast } from "react-toastify";

export const AccountButton = () => {
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [avatar_url, setAvatar] = useState<string | undefined>(undefined);
  const router = useRouter();
  const { address, isReconnecting } = useAccount();
  const { disconnect } = useDisconnect();

  function handleDisconnectWallet() {
    disconnect();
    router.push("/");
  }

  function handleDirectToAccountPage() {
    router.push("/dashboard/account")
  }

  // Fetch user data when the component mounts
  useEffect(() => {
    async function handleFetchingUserData() {
      await fetchUserDataOnChain(address as `0x${string}`)
        .then(async ({ username, avatar_url, bio_url }) => {
          setUsername(username);
          setAvatar(avatar_url);
        })
        .catch((error) => {
          toast.error(`Error fetching user data: ${error.message}`);
        });
    }

    if (address) {
      handleFetchingUserData();
    }
  }, [address]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage
              src={avatar_url}
              alt={"User's avartar - SkillChain"}
            />
            <AvatarFallback className="rounded-lg">SK</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{username}</span>
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
              <span className="truncate font-semibold">{username}</span>
              <span className="truncate text-xs">{address}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleDirectToAccountPage}>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
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
