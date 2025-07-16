"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardView() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard/overview");
  }, []);

  return <></>
}
