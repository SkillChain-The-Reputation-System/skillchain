"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "./image-input";
import { useWriteContract } from 'wagmi'
import { ContractConfig_UserDataManager } from "@/constants/contracts-config";
import { useState } from "react";
import { readContract } from '@wagmi/core'
import { wagmiConfig } from "@/features/wallet/Web3Provider";


const profileFormSchema = z.object({
  username: z.string().optional(),
  bio: z.string().max(160).optional(),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  username: "",
  bio: "",
  avatar: "",
};

export function ProfileForm() {
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [isCheckingUsernameAvailable, setIsCheckingUsernameAvailable] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { data: hash, writeContract, isPending } = useWriteContract()

  function onSubmit(data: ProfileFormValues) {
    writeContract({
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: 'setUserPersonalData',
      args: [data.username, data.avatar, data.bio],
    })
  }

  // Function to handle username availability check
  const handleCheckAvailability = async () => {
    const username = form.getValues("username");
    if (!username) {
      setAvailabilityMessage("Please enter a valid username.");
      return;
    }

    setIsCheckingUsernameAvailable(true);
    setAvailabilityMessage("Checking...");

    const isAvailable = await readContract(wagmiConfig, {
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: 'checkUsernameAvailable',
      args: [username],
    }) as boolean;
    setAvailabilityMessage(
      isAvailable ? "Username is available!" : "Username is taken."
    );
    setIsCheckingUsernameAvailable(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="SkillChain_User_123" {...field} />
              </FormControl>
              <Button
                type="button" // Prevent form submission
                onClick={handleCheckAvailability}
                disabled={isCheckingUsernameAvailable}
              >
                {isCheckingUsernameAvailable ? "Checking..." : "Check Availability"}
              </Button>
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym. You can only change this ONCE. <br />
                IMPORTANT: This username must be unique across the platform.
                Submit to check availability.
              </FormDescription>
              <FormMessage />
              {availabilityMessage && (
                <p
                  className={`text-sm ${availabilityMessage.includes("available")
                    ? "text-green-600"
                    : "text-red-600"
                    }`}
                >
                  {availabilityMessage}
                </p>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="I am a software engineer with a passion for blockchain technology."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add an avatar to your profile. This will be visible to other users.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <ImageUploadField field={field} />
              </FormControl>
              <FormDescription>
                Describe yourself in a few sentences. This will be visible to
                other users.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} >Update profile</Button>
        {isPending && 'Confirming...'}
        {hash && <div>Transaction Hash: {hash}</div>}

      </form>
    </Form>
  );
}
