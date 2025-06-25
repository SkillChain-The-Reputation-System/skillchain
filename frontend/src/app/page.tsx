"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function HomePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  useEffect(() => {
    // Redirect based on wallet connection status
    if (isConnected) {
      router.push("/dashboard");
    } else {
      router.push("/signin");
    }
  }, [isConnected, router]);

  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">SkillChain</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
