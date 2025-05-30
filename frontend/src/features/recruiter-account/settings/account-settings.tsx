"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function AccountSettings() {
  // Get wallet address from useAccount hook
  const { address } = useAccount();

  // Mock data for account settings
  const [accountData, setAccountData] = useState({
    remainingTokens: 750,
    isActive: true,
    registeredDate: "March 15, 2024",
    lastLogin: "May 27, 2025",
  });
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Function to copy wallet address to clipboard
  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        // You can add a toast notification here if needed
      } catch (err) {
        console.error("Failed to copy address:", err);
      }
    }
  };

  // Mock function to simulate fetching account data
  useEffect(() => {
    if (address) {
      // Simulate API call with mock data
      const fetchAccountData = () => {
        // Generate some mock data based on wallet address
        const addressNumber = parseInt(address.slice(-4), 16);
        setAccountData({
          remainingTokens: 500 + (addressNumber % 1000),
          isActive: true,
          registeredDate: "March 15, 2024",
          lastLogin: "May 27, 2025",
        });
      };

      fetchAccountData();
    }
  }, [address]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Information</CardTitle>
          <CardDescription>
            Manage your blockchain wallet and tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Connected Wallet
            </h3>
            <div className="flex items-center justify-between space-x-4">
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm truncate line-clamp-1">
                {address ? address : "Not connected"}
              </code>
              <Button
                variant="outline"
                className="cursor-pointer"
                size="sm"
                onClick={handleCopyAddress}
              >
                Copy Address
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Recruiter Tokens</h3>
                <p className="text-sm text-muted-foreground">
                  Tokens required to post jobs and access premium features
                </p>
              </div>
              <Badge
                variant={
                  accountData.remainingTokens > 100 ? "default" : "destructive"
                }
                className="px-3 py-1"
              >
                {accountData.remainingTokens} Tokens
              </Badge>
            </div>
            {accountData.remainingTokens < 100 && (
              <Alert variant="destructive" className="mt-2">
                <AlertTitle>Low Token Balance</AlertTitle>
                <AlertDescription>
                  Your token balance is running low. Purchase more tokens to
                  continue posting jobs.
                </AlertDescription>
              </Alert>
            )}
            <div className="mt-2 flex justify-end">
              <Button variant="outline" size="sm" className="cursor-pointer">
                Purchase More Tokens
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-medium">Account Status</h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Recruiter Status</p>
              <Badge variant={accountData.isActive ? "default" : "outline"}>
                {accountData.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Registered Since</p>
              <span className="text-sm text-muted-foreground">{accountData.registeredDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Last Login</p>
              <span className="text-sm text-muted-foreground">{accountData.lastLogin}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountSettings;
