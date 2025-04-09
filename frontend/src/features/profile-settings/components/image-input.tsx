import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadFieldProps {
  previewAvatarURL?: string | undefined;
  field: {
    value: Blob | undefined;
    onChange: (value: Blob | undefined) => void;
  };
}

export function ImageUploadField({ previewAvatarURL, field }: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string|undefined>(previewAvatarURL);
  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles:Blob[]) => {
      const file = acceptedFiles[0];
      const file_url = URL.createObjectURL(file);
      setPreview(file_url);
      field.onChange(file); // Update form field value
    },
  });

  // Set the preview URL when the component mounts or when the previewAvatarURL changes
  useEffect(() => {
    if (previewAvatarURL) {
      setPreview(previewAvatarURL);
    }
  }, [previewAvatarURL]);

  return (
    <section className="container mx-auto px-4 py-8">
      <div
        {...getRootProps({
          className: `
        dropzone
        border-2 border-dashed border-gray-300
        rounded-lg
        p-8
        text-center
        bg-gray-50
        hover:border-blue-500
        hover:bg-blue-50
        transition-all duration-300
        cursor-pointer
        dark:bg-muted/50
        dark:hover:border-primary
        dark:hover:bg-muted
        ${isDragActive ? "border-blue-500 bg-blue-50 dark:bg-muted" : ""}
      `,
        })}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400 dark:text-muted-foreground" />
          <p className="text-gray-600 text-lg">
            <span className="font-semibold text-blue-600 dark:text-primary">
              Drag 'n' drop
            </span>{" "}
            some files here
          </p>
          <p className="text-gray-500 text-sm dark:text-muted-foreground">
            or click to select files
          </p>
          <Button type="button">Browse Files</Button>
        </div>
      </div>

      {preview && (
        <div className="mt-6 max-w-xs mx-auto">
          <div className="w-[300px] h-[300px] overflow-hidden rounded-3xl shadow-md border border-gray-200 dark:border-gray-700">
            <Image
              width={1000} // Original image width
              height={1000} // Original image height
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </section>
  );
}
