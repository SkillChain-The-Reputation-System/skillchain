"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";

export function NoWalletConnected() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="p-6 text-center">
        <CardContent>
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle className="mb-2">No Wallet Connected</CardTitle>
          <CardDescription>
            Please connect your wallet to view your profile
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
