"use client";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedRoute({
    children
}: {
    children: React.ReactNode;
}) {
    const { address, isConnected, isConnecting, isReconnecting, isDisconnected } = useAccount();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname !== '/' && !isConnected && !isConnecting && isDisconnected && !isReconnecting && address) { 
            // If the user is not authenticated and is trying to access a protected route, redirect to login page
            router.push('/'); 
        }
    }, [isConnected, isConnecting, isReconnecting, isDisconnected]);

    return (
        <>
            {children}
        </>
    );
}
