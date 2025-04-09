"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function DashboardView() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard/overview");
  }, []);

  return <></>
}
