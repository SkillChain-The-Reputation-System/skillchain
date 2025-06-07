"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { XCircle, CreditCard, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import {
  getRecruiterSubscriptionStatus,
} from "@/lib/get/get-recruiter-subscription-data-utils";
import { useRouter } from "next/navigation";
import { pageUrlMapping } from "@/constants/navigation";

export default function RecruiterRequirementBanner() {
  const { address } = useAccount();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkRecruiterStatus = async () => {
      if (!address) {
        setShow(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const status = await getRecruiterSubscriptionStatus(address);

        if (!status.isRecruiter) {
          setShow(true);
        } else {
          // User has recruiter role (which means budget is sufficient)
          setShow(false);
        }
      } catch (error) {
        console.error("Error checking recruiter status:", error);
        setShow(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkRecruiterStatus();
  }, [address]);

  const handleDepositClick = () => {
    router.push(`${pageUrlMapping.recruiter_account}?tab=account`);
  };

  // Show loading state during verification
  if (isLoading) {
    return (
      <Alert className="rounded-none mb-2 border-blue-500 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-400 border-l-4 border-l-blue-600 dark:border-l-blue-400">
        <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
        <AlertTitle className="text-blue-800 dark:text-blue-200 font-medium">
          Verifying Recruiter Status
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Checking your recruiter subscription status...
        </AlertDescription>
      </Alert>
    );
  }

  if (!show) return null;

  return (
    <Alert
      variant="destructive"
      className="rounded-none mb-2 border-red-500 bg-red-50 dark:bg-red-950/50 dark:border-red-400 border-l-4 border-l-red-600 dark:border-l-red-400"
    >
      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      <AlertTitle className="text-red-800 dark:text-red-200 font-medium">
        Recruiter Access Required
      </AlertTitle>
      <AlertDescription className="text-red-700 dark:text-red-300">
        <div className="space-y-2">
          <p>
            Your budget balance is not enough to access recruiter features.
          </p>
          <Button
            onClick={handleDepositClick}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white item"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Deposit Tokens
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
