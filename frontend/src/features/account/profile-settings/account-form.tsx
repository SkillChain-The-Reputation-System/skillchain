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
  // const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Format address for display
  const formattedAddress = address 
    ? address
    : "Not connected";

  const handleDisconnect = () => {
    disconnect();
    toast.success("Wallet disconnected");
    router.push("/"); // Redirect to home page
  };

  // Delete account feature removed

  // Reset confirmation if user navigates away
  // useEffect for delete account confirmation removed

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
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current wallet</p>
              <p className="text-sm text-muted-foreground">
                {formattedAddress}
              </p>
            </div>
            <Button onClick={handleDisconnect}>Disconnect</Button>
          </div>
        </div>

        {/* Data & Privacy section with Delete Account feature removed */}
      </CardContent>
    </Card>
  );
}
