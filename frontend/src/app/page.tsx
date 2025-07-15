"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Image from "next/image";

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
      <div className="text-center flex flex-col items-center">
        <Image
          src="/logo.svg"
          alt="SkillChain logo"
          width={120}
          height={120}
          className="mb-4 logo-loop"
        />
        <h1 className="text-2xl font-bold mb-2">SkillChain</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
