import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProviders from "@/components/layout/theme-providers";
import { Web3Provider } from "@/features/wallet/Web3Provider";
import ProtectedRoute from "@/components/layout/protected-route";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillChain",
  description:
    "A Reputation System For Resume Verification And Skill Assessment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          <ProtectedRoute>
            <ToastContainer />
            <ThemeProviders>{children}</ThemeProviders>
          </ProtectedRoute>
        </Web3Provider>
      </body>
    </html>
  );
}
