"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getUserProfileData,
  isUserRegistered,
} from "@/lib/get/get-user-data-utils";
import {
  registerProfile,
  updateProfile,
} from "@/lib/set/set-user-data-utils";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { CircularAvatarInput } from "./circular-avatar-input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Create a Zod schema for the form validation
const profileFormSchema = z.object({
  fullname: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(),
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
  fullname: "",
  location: "",
  email: "",
  bio: "",
  avatar: undefined,
};

export function ProfileForm() {
  // State to mange the disabled state of the submit button
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // Add this state
  // State to manage the avatar URL
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  // State to track if user is registered
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  // Router for navigation and refreshing the page
  const router = useRouter();

  // Get the connected user's address
  const { address } = useAccount();

  // Get user context for updating user data
  const { updateUserData } = useUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  // Fetch user data -> populate the form fields
  useEffect(() => {
    async function fetchUserData() {
      if (!address) {
        setIsLoadingData(false);
        return;
      }

      setIsLoadingData(true); // Set loading to true

      // Check if user is registered
      const userRegistered = await isUserRegistered(address as `0x${string}`);
      setIsRegistered(userRegistered);

      if (userRegistered) {
        // Fetch user profile data if registered
        const userProfile = await getUserProfileData(address as `0x${string}`);

        console.log("Fetched user profile on profile-form.tsx:", userProfile);

        if (userProfile) {
          // Set the avatar URL if it exists
          if (userProfile.avatar_url && userProfile.avatar_url.length > 0) {
            setAvatarUrl(userProfile.avatar_url);
          }

          // Set the form values with the fetched data
          form.reset({
            fullname: userProfile.fullname,
            location: userProfile.location,
            email: userProfile.email,
            bio: userProfile.bio,
          });

          // Initialize context with fetched data
          updateUserData({
            fullname: userProfile.fullname,
            avatar_url: userProfile.avatar_url,
          });
        }
      }

      setIsLoadingData(false); // Set loading to false when done
    }

    fetchUserData();
  }, [address, form]);

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitDisabled(true);

    try {
      if (!address) {
        toast.error("Please connect your wallet first");
        return;
      }

      if (isRegistered) {
        // Update existing profile
        const dataId = await updateProfile(address, data);
        toast.success("Profile updated successfully!");

        // Directly update context with submitted data (more reliable)
        const newAvatarUrl = data.avatar
          ? URL.createObjectURL(data.avatar)
          : avatarUrl;
        updateUserData({
          fullname: data.fullname || undefined,
          avatar_url: newAvatarUrl,
        });

        router.refresh();
      } else {
        // Register new profile
        const txHash = await registerProfile(address as `0x${string}`, data);
        toast.success("Profile registered successfully!");
        setIsRegistered(true);

        // Directly update context with submitted data
        const newAvatarUrl = data.avatar ? URL.createObjectURL(data.avatar) : undefined;
        updateUserData({
          fullname: data.fullname || undefined,
          avatar_url: newAvatarUrl
        });
        
        router.refresh();
      }
    } catch (error: any) {
      const errorMessage = error?.message || "An unexpected error occurred";
      if (isRegistered) {
        toast.error("Error updating profile: " + errorMessage);
      } else {
        toast.error("Error registering profile: " + errorMessage);
      }
    } finally {
      setIsSubmitDisabled(false);
    }
  }
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          {isRegistered
            ? "Update your profile information"
            : "Register your profile to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload - Using the circular component at the top */}
            <div className="flex justify-center mb-6">
              <CircularAvatarInput form={form} avatarURL={avatarUrl} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name Field */}
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location Field */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Your location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your email address"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Bio Field */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                    <FormControl>
                    <Textarea
                      placeholder="Tell us a little about yourself"
                      className="min-h-32"
                      {...field}
                    />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                disabled={isSubmitDisabled || isLoadingData} // Disable while loading or submitting
                className="px-8"
              >
                {isRegistered ? "Update Profile" : "Register Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
