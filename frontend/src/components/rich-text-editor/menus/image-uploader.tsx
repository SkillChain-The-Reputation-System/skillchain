// Import hooks
import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { useDropzone } from "react-dropzone";

// Import Lucide-react Icons
import { ImagePlus, UploadCloud } from 'lucide-react'
import { Toggle } from "@/components/ui/toggle";

// Import UI components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import ToggleTooltip from "@/components/toggle-tooltip"

export function ImageUploader({ editor }: { editor: Editor | null }) {
  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles: Blob[]) => {
      const file = acceptedFiles[0];
      if (file && editor) {
        const file_url = URL.createObjectURL(file);
        editor.chain().focus().setImage({ src: file_url }).run();
      }
    },
  });

  if (!editor) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ToggleTooltip
          tooltip="Image Upload"
        >
          <ImagePlus />
        </ToggleTooltip>
      </PopoverTrigger>

      <PopoverContent className="min-w-md border-2 border-black dark:border-white space-y-4">
        <div
          {...getRootProps({
            className: `
                    dropzone
                    border-2 border-dashed border-gray-300
                    rounded-lg
                    p-4
                    text-center
                    bg-gray-100
                    hover:border-blue-500
                    hover:bg-blue-50
                    transition-all duration-300
                    cursor-pointer
                    dark:bg-muted/50
                    dark:hover:border-primary
                    dark:hover:bg-muted
                    ${isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-muted"
                : ""
              }
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
              an image here or {" "}
              <span className="font-semibold text-blue-600 dark:text-primary">
                Browse
              </span>
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}