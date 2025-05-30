import { Editor } from "@tiptap/react";
import ToggleTooltip from "@/components/toggle-tooltip"

// Import Lucide-react Icons
import {
  List,
  ListOrdered,
} from "lucide-react";

interface ListStyle {
  label: string
  icon: React.ReactNode
  onClick: () => void
  isActive: boolean
}

export function ListingSection({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null
  }

  const actionsConfig: ListStyle[] = [
    {
      label: "List",
      icon: <List className="size-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList")
    },
    {
      label: "Orderd List",
      icon: <ListOrdered className="size-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList")
    }
  ]

  const renderItem = ({ label, icon, onClick, isActive }: ListStyle) => {
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