"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { ImageUploadField } from "./image-input";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { fetchUserDataOnChain } from "@/lib/fetching-onchain-data-utils";
import { fetchStringDataOffChain } from "@/lib/fetching-offchain-data-utils";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import UsernameField from "./username-input";
import { BioField } from "./bio-input";
import { updateProfile } from "@/lib/write-onchain-utils";

// Create a Zod schema for the form validation
const profileFormSchema = z.object({
  username: z.string().optional(),
  bio: z.string().max(2000).optional(),
  avatar: z
    .instanceof(Blob)
    .refine((file) => file.type.startsWith("image/"), {
      message: "File must be an image",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Image must be less than 5MB",
    })
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Default values for the form fields
const defaultValues: Partial<ProfileFormValues> = {
  username: "",
  bio: "",
  avatar: undefined,
};

export function ProfileForm() {
  // State to mange the disabled state of the submit button
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  // State to manage the avatar URL
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  // State to manage registered username
  const [registeredUsername, setRegisteredUsername] = useState<
    string | undefined
  >(undefined);
  // Router for navigation and refreshing the page
  const router = useRouter();

  // Get the connected user's address
  const { address } = useAccount();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Fetch user data -> populate the form fields
  useEffect(() => {
    async function fetchUserData() {
      // if user not connected or no address
      if (!address) return;

      // Fetch user data from the smart contract
      const { username, avatar_url, bio_url } = await fetchUserDataOnChain(
        address
      );

      // Get the bio data from the URL if it exists
      let bio = undefined;
      if (bio_url && bio_url?.length > 0) {
        bio = await fetchStringDataOffChain(bio_url);
      }

      // Set the avatar URL if it exists
      if (avatar_url && avatar_url?.length > 0) {
        setAvatarUrl(avatar_url);
      }

      // Set registerd username
      if (username && username.length > 0) {
        setRegisteredUsername(username);
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
    await updateProfile(address as `0x${string}`, data)
      .then((txHash) => {
        toast.success("Profile updated successfully!");
        // Update the registered username state to match the new username
        if (data.username) {
          setRegisteredUsername(data.username);
        }
        router.refresh(); // Refresh the page to reflect the changes
      })
      .catch((error) => {
        toast.error("Error updating profile: " + error.message);
      });
    setIsSubmitDisabled(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <UsernameField
          form={form}
          registerUsername={registeredUsername}
        ></UsernameField>
        <BioField form={form}></BioField>
        <ImageUploadField form={form} avatarURL={avatarUrl}></ImageUploadField>
        <Button type="submit" disabled={isSubmitDisabled}>
          Update profile
        </Button>
      </form>
    </Form>
  );
}
