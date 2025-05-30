import { Editor } from "@tiptap/react";
import ToggleTooltip from "@/components/toggle-tooltip"

// Import Lucide-react Icons
import {
  Bold,
  Code,
  Italic,
  Strikethrough,
  Underline
} from "lucide-react";

interface TextStyle {
  label: string
  icon: React.ReactNode
  onClick: () => void
  isActive: boolean
}

export function TextDecorationSection({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null
  }

  const actionsConfig: TextStyle[] = [
    {
      label: "Bold",
      icon: <Bold className="size-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold")
    },
    {
      label: "Italic",
      icon: <Italic className="size-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic")
    },
    {
      label: "Underline",
      icon: <Underline className="size-4" />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive("underline")
    },
    {
      label: "Strikethrough",
      icon: <Strikethrough className="size-4" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike")
    },
    {
      label: "Code",
      icon: <Code className="size-4" />,
      onClick: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code")
    },
  ]

  const renderItem = ({ label, icon, onClick, isActive }: TextStyle) => {
    return (
      <ToggleTooltip
        key={label}
        tooltip={label}
        isActive={isActive}
        onClick={onClick}
      >
        {icon}
      </ToggleTooltip>
    )
  }

  return (
    <>
      {actionsConfig.map((action) =>
        renderItem(action)
      )}
    </>
  )
}