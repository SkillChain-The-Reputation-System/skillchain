"use client";

import Link from "next/link";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";
import { pageUrlMapping } from "@/constants/navigation";

interface RegistrationNotificationBannerProps {
  isRegistered: boolean;
  isLoading: boolean;
}

export function RegistrationNotificationBanner({
  isRegistered,
  isLoading,
}: RegistrationNotificationBannerProps) {
  // Don't show the banner if loading or if user is already registered
  if (isLoading || isRegistered) {
    return null;
  }
  return (
    <Alert className="border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
      <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold">
        Complete Your Profile Registration
      </AlertTitle>
      <AlertDescription className="text-blue-800 dark:text-blue-200">
        <p className="mb-3">
          You haven't registered your profile yet. Complete your registration to access all features and start building your reputation on the platform.
        </p>
        <Link href={pageUrlMapping.account_settings}>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white">
            Register Now
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
