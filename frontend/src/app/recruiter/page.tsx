"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecruiterPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/recruiter/jobs");
  }, [router]);

  return <></>;
}
