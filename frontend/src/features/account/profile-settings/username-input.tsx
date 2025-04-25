"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { ProfileFormValues } from "./profile-form";
import { checkUsernameAvailable } from "@/lib/fetching-onchain-data-utils";

interface UsernameFieldProps {
  registerUsername: string | undefined,
  form: any;
}

export default function UsernameField({
  registerUsername,
  form
}: UsernameFieldProps) {
  // State to manage the availability message and loading state
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(
    null
  );

  // Function to handle username availability check
  const handleCheckAvailability = async () => {
    const username = form.getValues("username");

    if (!username) {
      setAvailabilityMessage("Please enter a valid username.");
      return;
    }

    if (username === registerUsername) {
      setAvailabilityMessage("");
      return;
    }

    setAvailabilityMessage("Checking...");

    const isAvailable = await checkUsernameAvailable(username)
    setAvailabilityMessage(
      isAvailable ? "Username is available!" : "Username is taken."
    );
  };

  // Watch for changes in the username field and check availability
  useEffect(() => {
    const subscription = form.watch(async (value:ProfileFormValues) => {
      await handleCheckAvailability();
    });
    return () => subscription.unsubscribe(); // Cleanup subscription on unmount
  }, [form.watch]);

  return (
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input placeholder="SkillChain_User_123" {...field} />
          </FormControl>
          {availabilityMessage && form.getValues("username") !== registerUsername && (
            <p
              className={`text-sm ${
                availabilityMessage.includes("available")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {availabilityMessage}
            </p>
          )}
          <FormDescription>
            This is your public display name. It can be your real name or a
            pseudonym. <br />
            Username is unique across the system, check if it is available
            before submitting.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
