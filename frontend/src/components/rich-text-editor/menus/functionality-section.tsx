import { Editor } from "@tiptap/react";
import ToggleTooltip from "@/components/toggle-tooltip"

// Import Lucide-react Icons
import {
  Highlighter,
  Quote,
  SquareCode,
  Subscript,
  Superscript,
} from "lucide-react";

interface FunctionStyle {
  label: string
  icon: React.ReactNode
  onClick: () => void
  isActive: boolean
}

export function FunctionalitySection({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null
  }

  const actionsConfig: FunctionStyle[] = [
    {
      label: "Subscript",
      icon: <Subscript className="size-4" />,
      onClick: () => editor.chain().focus().toggleSubscript().run(),
      isActive: editor.isActive("subscript")
    },
    {
      label: "Superscript",
      icon: <Superscript className="size-4" />,
      onClick: () => editor.chain().focus().toggleSuperscript().run(),
      isActive: editor.isActive("superscript")
    },
    {
      label: "Blockquote",
      icon: <Quote className="size-4" />,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote")
    },
    {
      label: "Highlight",
      icon: <Highlighter className="size-4" />,
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive("highlight")
    },
    {
      label: "Code Block",
      icon: <SquareCode className="size-4" />,
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock")
    }
  ]

  const renderItem = ({ label, icon, onClick, isActive }: FunctionStyle) => {
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