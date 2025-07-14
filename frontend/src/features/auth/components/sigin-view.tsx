"use client";
import Link from "next/link";
import { ConnectButton } from "@/components/connect-button";
import Image from "next/image";
import TypingText from "@/components/typing-text";

export default function SignInViewPage() {
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-[3fr_2fr] lg:px-0">
      <div className="relative hidden h-full flex-col items-center justify-center bg-gradient-to-br from-sky-700 via-blue-500 to-sky-300 p-10 text-white dark:border-r lg:flex">
        <TypingText
          text="Welcome to SkillChain"
          className="z-10 text-4xl font-bold text-center drop-shadow-md font-mono"
        />
      </div>
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center justify-center pb-10 space-y-2">
            <Image src="/logo.svg" alt="SkillChain logo" width={80} height={80} />
            <span className="text-3xl font-bold text-sky-700">SkillChain</span>
          </div>

          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Connect a Wallet
            </h1>
          </div>

          <ConnectButton></ConnectButton>
        </div>
      </div>
    </div>
  );
}
