import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadFieldProps {
  field: {
    value: string | undefined;
    onChange: (value: string) => void;
  };
}

export function ImageUploadField({ field }: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string>(field.value || "");
  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      field.onChange(previewUrl); // Update form field value
    },
  });

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

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
