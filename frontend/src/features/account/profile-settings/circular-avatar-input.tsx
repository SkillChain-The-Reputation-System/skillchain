import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface CircularAvatarInputProps {
  form: any;
  avatarURL?: string | undefined;
}

export const CircularAvatarInput = ({
  form,
  avatarURL,
}: CircularAvatarInputProps) => {
  // State to manage the preview URL
  const [preview, setPreview] = useState<string | undefined>(avatarURL);

  // Set the preview URL when the component mounts or when the avatarURL changes
  useEffect(() => {
    if (avatarURL) {
      setPreview(avatarURL);
    }
  }, [avatarURL]);

  // Dropzone configuration
  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles: Blob[]) => {
      const file = acceptedFiles[0];
      const file_url = URL.createObjectURL(file);
      setPreview(file_url);
      form.setValue("avatar", file);
    },
  });

  return (
    <FormField
      control={form.control}
      name="avatar"
      render={({ field }) => {

        return (
          <FormItem className="flex flex-col items-center mb-8">
            <FormLabel className="text-center mb-2">Profile Picture</FormLabel>
            <FormControl>
              <div className="flex flex-col items-center">
                {!preview ? (
                  <div
                    {...getRootProps({
                      className: `
                        dropzone
                        w-40 h-40
                        rounded-full
                        border-2 border-dashed border-gray-300
                        flex flex-col items-center justify-center
                        bg-gray-50
                        hover:border-blue-500
                        hover:bg-blue-50
                        transition-all duration-300
                        cursor-pointer
                        dark:bg-muted/50
                        dark:hover:border-primary
                        dark:hover:bg-muted
                        ${
                          isDragActive
                            ? "border-blue-500 bg-blue-50 dark:bg-muted"
                            : ""
                        }
                      `,
                    })}
                  >
                    <input {...getInputProps()} />
                    <UploadCloud className="h-10 w-10 text-gray-400 dark:text-muted-foreground" />
                    <p className="text-sm text-center text-gray-600 mt-2">
                      Upload photo
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
                      <Image
                        width={1000}
                        height={1000}
                        src={preview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPreview(undefined);
                          field.onChange(undefined);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
