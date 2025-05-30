"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface RecruiterAvatarInputProps {
  form: any;
  avatarURL?: string;
}

export const RecruiterAvatarInput = ({
  form,
  avatarURL,
}: RecruiterAvatarInputProps) => {
  const [preview, setPreview] = useState<string | undefined>(avatarURL);

  console.log("Receive avatarURL on recruiter-avatar-input.tsx:", avatarURL);

  // Update preview when avatarURL prop changes
  React.useEffect(() => {
    setPreview(avatarURL);
  }, [avatarURL]);

  return (
    <FormField
      control={form.control}
      name="recruiter_avatar"
      render={({ field }) => {
        const { isDragActive, getRootProps, getInputProps } = useDropzone({
          accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
          },
          maxFiles: 1,
          maxSize: 5 * 1024 * 1024, // 5MB
          onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
              const file = acceptedFiles[0];
              const fileUrl = URL.createObjectURL(file);
              setPreview(fileUrl);
              // Set the actual Blob file for form submission
              field.onChange(file);
            }
          },
          onDropRejected: (rejectedFiles) => {
            console.log("File rejected:", rejectedFiles);
          },
        });
        const handleRemoveImage = () => {
          setPreview(undefined);
          field.onChange(undefined);
        };

        return (
          <FormItem className="flex flex-col items-center">
            <FormLabel className="text-sm font-medium">Profile Picture</FormLabel>
            <FormControl>
              <div className="flex flex-col items-center space-y-4">
                {/* Avatar Preview/Upload Area */}
                <div
                  {...getRootProps()}
                  className={`
                    relative w-32 h-32 rounded-full border-2 border-dashed 
                    cursor-pointer transition-all duration-200 overflow-hidden
                    ${
                      isDragActive
                        ? "border-primary bg-primary/10"
                        : "border-gray-300 hover:border-primary hover:bg-gray-50"
                    }
                    ${preview ? "border-solid border-gray-200" : ""}
                  `}
                >
                  <input {...getInputProps()} />
                  
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Avatar preview"
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <User className="w-8 h-8 mb-2" />
                      <Upload className="w-4 h-4" />
                    </div>
                  )}
                  
                  {/* Overlay for drag state */}
                  {isDragActive && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded-full">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {preview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>

                {/* Helper Text */}
                <p className="text-xs text-gray-500 text-center max-w-xs">
                  Supports PNG, JPG, GIF up to 5MB.
                </p>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
