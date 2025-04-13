"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { ImageUploadField } from "./image-input";
import { useWriteContract } from "wagmi";
import { ContractConfig_UserDataManager } from "@/constants/contracts-config";
import { useEffect, useState } from "react";
import axios from "axios";
import { IrysUploadResponseInterface } from "@/lib/interfaces";
import { useAccount } from "wagmi";
import { fetchUserDataOnChain } from "@/lib/fetching-onchain-data-utils";
import { fetchStringDataOffChain } from "@/lib/fetching-offchain-data-utils";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import UsernameField from "./username-input";
import { BioField } from "./bio-input";

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
  // State to mange registered username
  const [registeredUsername, setRegisteredUsername] = useState<string | undefined>(undefined)
  // Router for navigation and refreshing the page
  const router = useRouter();

  // Get the connected user's address
  const { address } = useAccount();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { data: hash, writeContract, isPending } = useWriteContract();

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
    // Upload image to Irys and get the URL

    // No worry about the data duplicated on Irys because it will be handled by Irys itself
    // Upload data to Irys parallelly
    const [{data:image_upload_res_data}, {data:bio_upload_res_data}] = await Promise.all([
      axios.post<IrysUploadResponseInterface>(
        "/api/irys/upload/upload-file",
        data.avatar
      ),
      axios.post<IrysUploadResponseInterface>(
        "/api/irys/upload/upload-string",
        data.bio
      )
    ]);

    console.log("Image upload response:", image_upload_res_data);
    console.log("Bio upload response:", bio_upload_res_data);

    // Update contract with the new data
    writeContract({
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: "setUserPersonalData",
      args: [data.username, image_upload_res_data.url, bio_upload_res_data.url],
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <UsernameField form={form} registerUsername={registeredUsername}></UsernameField>
        <BioField form={form}></BioField>
        <ImageUploadField form={form} avatarURL={avatarUrl}></ImageUploadField>
        <Button type="submit" disabled={isSubmitDisabled}>
          Update profile
        </Button>
      </form>
    </Form>
  );
}
