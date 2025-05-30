"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  getRecruiterProfileData,
  isRecruiterProfileRegistered,
} from "@/lib/get/get-recruiter-data-utils";
import {
  updateRecruiterProfile,
  registerRecruiterProfile,
} from "@/lib/set/set-recruiter-data-utils";
import { useRecruiter } from "@/contexts/recruiter-context";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RecruiterAvatarInput } from "@/features/recruiter-account/settings/recruiter-avatar-input";

// Define our form schema with avatar as Blob instead of URL
const formSchema = z.object({
  recruiter_address: z.string(),
  recruiter_fullname: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  recruiter_email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  recruiter_phone: z.string().min(5, {
    message: "Phone number must be at least 5 characters.",
  }),
  recruiter_position: z.string().min(2, {
    message: "Position must be at least 2 characters.",
  }),
  recruiter_bio: z.string().min(10, {
    message: "Bio must be at least 10 characters.",
  }),
  recruiter_avatar: z
    .instanceof(Blob)
    .refine((file) => file.type.startsWith("image/"), {
      message: "File must be an image",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Image must be less than 5MB",
    })
    .optional(),
  company_name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  company_website: z.string().url({
    message: "Please enter a valid URL.",
  }),
  company_location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  company_industry: z.string().min(2, {
    message: "Industry must be at least 2 characters.",
  }),
  company_size: z.string(),
  company_description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

// Form values type with Blob avatar
export type RecruiterFormValues = z.infer<typeof formSchema>;

export function ProfileCompanyInfo() {
  // State to manage the avatar URL for display purposes
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  // State to manage the disabled state of the submit button
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  // State to track if recruiter is registered
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  // Get the connected recruiter's address
  const { address } = useAccount();

  // Router for navigation and refreshing the page
  const router = useRouter();

  // Get recruiter context for updating recruiter data
  const { updateRecruiterData } = useRecruiter();

  const form = useForm<RecruiterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recruiter_address: "",
      recruiter_fullname: "",
      recruiter_email: "",
      recruiter_phone: "",
      recruiter_position: "",
      recruiter_bio: "",
      recruiter_avatar: undefined,
      company_name: "",
      company_website: "",
      company_location: "",
      company_industry: "",
      company_size: "",
      company_description: "",
    },
    mode: "onChange",
  });

  // Fetch recruiter data -> populate the form fields
  useEffect(() => {
    async function fetchRecruiterData() {
      if (!address) {
        setIsLoadingData(false);
        return;
      }

      setIsLoadingData(true);

      try {
        // Check if recruiter is registered
        const recruiterRegistered = await isRecruiterProfileRegistered(
          address as `0x${string}`
        );
        setIsRegistered(recruiterRegistered);

        if (recruiterRegistered) {
          // TODO: Fetch recruiter profile data if registered
          const recruiterProfile = await getRecruiterProfileData(
            address as `0x${string}`
          );


          if (recruiterProfile) {
            // Set the avatar URL if it exists
            if (
              recruiterProfile.recruiter_avatar_url &&
              recruiterProfile.recruiter_avatar_url.length > 0
            ) {
              setAvatarUrl(recruiterProfile.recruiter_avatar_url);
            }

            // Set the form values with the fetched data
            form.reset({
              recruiter_address: recruiterProfile.recruiter_address,
              recruiter_fullname: recruiterProfile.recruiter_fullname,
              recruiter_email: recruiterProfile.recruiter_email,
              recruiter_phone: recruiterProfile.recruiter_phone,
              recruiter_position: recruiterProfile.recruiter_position,
              recruiter_bio: recruiterProfile.recruiter_bio,
              recruiter_avatar: undefined,
              company_name: recruiterProfile.company_name,
              company_website: recruiterProfile.company_website,
              company_location: recruiterProfile.company_location,
              company_industry: recruiterProfile.company_industry,
              company_size: recruiterProfile.company_size,
              company_description: recruiterProfile.company_description,
            });

            // Initialize context with fetched data
            updateRecruiterData({
              fullname: recruiterProfile.recruiter_fullname,
              company: recruiterProfile.company_name,
              position: recruiterProfile.recruiter_position,
              avatar_url: recruiterProfile.recruiter_avatar_url,
              email: recruiterProfile.recruiter_email,
              bio: recruiterProfile.recruiter_bio,
            });
          }
        }
      } catch (error) {
        toast.error("Failed to load recruiter data");
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchRecruiterData();
  }, [address, form, updateRecruiterData]);

  async function onSubmit(data: RecruiterFormValues) {
    setIsSubmitDisabled(true);

    try {
      if (!address) {
        toast.error("Please connect your wallet first");
        return;
      }

      if (isRegistered) {
        // TODO: Update existing profile
        await updateRecruiterProfile(address as `0x${string}`, data);

        // Update context with submitted data (to update recruiter info in account_button in the sidebar)
        const newAvatarUrl = data.recruiter_avatar
          ? URL.createObjectURL(data.recruiter_avatar)
          : avatarUrl;

        updateRecruiterData({
          fullname: data.recruiter_fullname,
          company: data.company_name,
          position: data.recruiter_position,
          avatar_url: newAvatarUrl,
          email: data.recruiter_email,
          bio: data.recruiter_bio,
        });

        toast.success("Profile updated successfully!");

        router.refresh();
      } else {
        // Register new profile
        await registerRecruiterProfile(address as `0x${string}`, data);

        toast.success("Profile registered successfully!");
        setIsRegistered(true);

        // Update context with submitted data
        const newAvatarUrl = data.recruiter_avatar
          ? URL.createObjectURL(data.recruiter_avatar)
          : undefined;

        updateRecruiterData({
          fullname: data.recruiter_fullname,
          company: data.company_name,
          position: data.recruiter_position,
          avatar_url: newAvatarUrl,
          email: data.recruiter_email,
          bio: data.recruiter_bio,
        });

        router.refresh();
      }
    } catch (error: any) {
      const errorMessage =
        error.message || error.shortMessage || "An unexpected error occurred";
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
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Information Section */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold">Profile Information</h3>
                <p className="text-sm text-muted-foreground">
                  Update your personal information as a recruiter
                </p>
              </div>

              <div className="space-y-4">
                {/* Avatar Input */}
                <div className="flex justify-center">
                  <RecruiterAvatarInput form={form} avatarURL={avatarUrl} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="recruiter_fullname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recruiter_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recruiter_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recruiter_position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="recruiter_bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border"></div>

            {/* Company Information Section */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold">Company Information</h3>
                <p className="text-sm text-muted-foreground">
                  Update your company details
                </p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">
                              11-50 employees
                            </SelectItem>
                            <SelectItem value="51-200">
                              51-200 employees
                            </SelectItem>
                            <SelectItem value="201-500">
                              201-500 employees
                            </SelectItem>
                            <SelectItem value="501+">501+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="company_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your company, mission, and values..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                disabled={isSubmitDisabled || isLoadingData}
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

export default ProfileCompanyInfo;
