import { Editor } from "@tiptap/react";
import type { Level } from "@tiptap/extension-heading"

// Import Lucide-react Icons
import { ChevronDown, Heading } from 'lucide-react'

// Import UI components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ToggleTooltip from "@/components/toggle-tooltip"

// Import utils
import { cn } from "@/lib/utils";
import React from "react";

interface TextStyle {
  label: string
  level?: Level
  className: string
}

export function HeadingSection({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null
  }

  const actionsConfig: TextStyle[] = [
    {
      label: "Normal Text",
      className: "m-1",
    },
    {
      label: "Heading 1",
      level: 1,
      className: "m-1 text-3xl font-extrabold",
    },
    {
      label: "Heading 2",
      level: 2,
      className: "m-1 text-xl font-bold",
    },
    {
      label: "Heading 3",
      level: 3,
      className: "m-1 text-lg font-semibold"
    }
  ]

  const handleStyleChange = (level?: Level) => {
    if (level) {
      editor.chain().focus().toggleHeading({ level }).run()
    } else {
      editor.chain().focus().setParagraph().run()
    }
  }

  const renderMenuItem = ({ label, level, className }: TextStyle) => {
    return (
      <DropdownMenuItem
        key={label}
        onClick={() => handleStyleChange(level)}
        className={cn("flex flex-row items-center justify-between gap-4 cursor-pointer", className,
          {
            "bg-accent": level
              ? editor.isActive("heading", { level })
              : editor.isActive("paragraph"),
          },
        )}
      >
        {label}
      </DropdownMenuItem>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToggleTooltip
            isActive={editor.isActive("heading")}
            tooltip="Headings"
          >
            <Heading className="size-4" />
            <ChevronDown className="size-4" />
          </ToggleTooltip>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-full border border-black">
          {actionsConfig.map((action) =>
            renderMenuItem(action)
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}