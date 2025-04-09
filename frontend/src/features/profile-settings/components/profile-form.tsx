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
import { useEffect, useState } from "react";
import { readContract } from '@wagmi/core'
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import axios from "axios";
import { IrysUploadResponseInterface } from "@/lib/interfaces";
import { useAccount } from 'wagmi';
import { fetchUserDataOnChain } from "@/lib/fetching-onchain-data-utils";
import { fetchStringDataOffChain } from "@/lib/fetching-offchain-data-utils";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Create a Zod schema for the form validation
const profileFormSchema = z.object({
  username: z.string().optional(),
  bio: z.string().max(2000).optional(),
  avatar: z.instanceof(Blob)
    .refine((file) => file.type.startsWith('image/'), {
      message: 'File must be an image',
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'Image must be less than 5MB',
    })
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


// Default values for the form fields
const defaultValues: Partial<ProfileFormValues> = {
  username: "",
  bio: "",
  avatar: undefined,
};


export function ProfileForm() {
  // State to manage the availability message and loading state
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  // State to manage the loading state of the username availability check
  const [isCheckingUsernameAvailable, setIsCheckingUsernameAvailable] = useState(false);
  // State to mange the disabled state of the submit button
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  // State to manage the avatar URL
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  // Router for navigation and refreshing the page
  const router = useRouter();

  // Get the connected user's address
  const { address } = useAccount();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { data: hash, writeContract, isPending } = useWriteContract()

  // Disable the submit button when the transaction is pending
  useEffect(() => {
    setIsSubmitDisabled(isPending);
    if (isPending) {
      toast.info("Transaction is pending. Please wait...");
    }
    if (!isPending && hash) {
      toast.success("Profile updated successfully!");
      router.refresh(); // Refresh the page to reflect the changes
    }
  }, [isPending]);

  // Fetch user data -> populate the form fields
  useEffect(() => {
    async function fetchUserData() {
      // if user not connected or no address
      if (!address) return;

      // Fetch user data from the smart contract
      const { username, avatar_url, bio_url } = await fetchUserDataOnChain(address);

      // Get the bio data from the URL if it exists
      let bio = undefined;
      if (bio_url && bio_url?.length > 0) {
        bio = await fetchStringDataOffChain(bio_url);
      }

      // Set the avatar URL if it exists
      if (avatar_url && avatar_url?.length > 0) {
        setAvatarUrl(avatar_url);
      }

      // Set the form values with the fetched data
      form.reset({
        username: username,
        bio: bio,
      });
    }

    fetchUserData();
  }, [address]);


  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitDisabled(true);
    // Upload image to Irys and get the URL
    const { data: image_upload_res_data } = await axios.post<IrysUploadResponseInterface>('/api/irys/upload/upload-file', data.avatar);
    console.log(image_upload_res_data);

    // Upload bio to Irys and get the URL
    const { data: bio_upload_res_data } = await axios.post<IrysUploadResponseInterface>('/api/irys/upload/upload-string', data.bio);
    console.log(bio_upload_res_data);

    // Update contract with the new data
    writeContract({
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: 'setUserPersonalData',
      args: [data.username, image_upload_res_data.url, bio_upload_res_data.url],
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
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym. <br />
                Username is unique across the system, check if it is available before submitting.
              </FormDescription>
              <FormMessage />
              <Button
                type="button" // Prevent form submission
                onClick={handleCheckAvailability}
                disabled={isCheckingUsernameAvailable}
              >
                {isCheckingUsernameAvailable ? "Checking..." : "Check Availability"}
              </Button>
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
                Describe yourself in a few sentences. This will be visible to
                other users.
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
                <ImageUploadField field={field} previewAvatarURL={avatarUrl} />
              </FormControl>
              <FormDescription>
                Add a profile picture. This will be visible to other users.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitDisabled} >Update profile</Button>
      </form>
    </Form>
  );
}
