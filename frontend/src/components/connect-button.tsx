import { ConnectKitButton } from "connectkit";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export const ConnectButton = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        if (isConnected) {
          redirect("/dashboard")
        }
        return (
          <Button onClick={show}>{isConnected ? address : "Connect"}</Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};
