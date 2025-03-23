"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function Overview() {
  const { isDisconnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isDisconnected) {
      router.push("/"); // Redirect to home if wallet is disconnected
    } else {
      router.push("/dashboard/overview");
    }
  }, [isDisconnected,  router]);

  return <></>
}
