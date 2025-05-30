"use client";

import { useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function AccountForm() {
  const router = useRouter();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Format address for display
  const formattedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}` 
    : "Not connected";

  const handleDisconnect = () => {
    disconnect();
    toast.success("Wallet disconnected");
    router.push("/"); // Redirect to home page
  };

  const handleDeleteAccount = () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }

    // TODO: Implement actual account deletion logic here
    toast.success("Account deletion requested");
    disconnect();
    router.push("/");
  };

  // Reset confirmation if user navigates away
  useEffect(() => {
    return () => {
      setIsConfirmingDelete(false);
    };
  }, []);

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account settings and connected wallets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium">Connected Wallet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your blockchain wallet connected to your account
          </p>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current wallet</p>
              <p className="text-sm text-muted-foreground">
                {formattedAddress}
              </p>
            </div>
            <Button variant="outline" onClick={handleDisconnect}>Disconnect</Button>
          </div>
        </div>

        <div>
          <h3 className="font-medium">Data & Privacy</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your data and privacy settings
          </p>
          <Separator className="my-4" />
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Delete Account</AlertTitle>
            <AlertDescription>
              Permanently delete your account and all of your data. This action cannot be undone.
            </AlertDescription>
            <div className="mt-4">
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
              >
                {isConfirmingDelete ? "Confirm Delete" : "Delete Account"}
              </Button>
            </div>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
