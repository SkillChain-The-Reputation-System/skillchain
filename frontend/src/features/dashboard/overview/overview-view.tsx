"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function OverviewView() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push("/"); // Redirect to home if wallet is disconnected
    } else {
      router.push("/dashboard/overview");
    }
  }, [isConnected, router]);

  return <></>
}
