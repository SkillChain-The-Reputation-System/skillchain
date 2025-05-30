import { Editor } from "@tiptap/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import ToggleTooltip from "@/components/toggle-tooltip"
import React from "react"

import {
  Grid3x3,
  Grid2X2Plus,
  Grid2X2X,
  Settings2,
  Columns3Cog
} from "lucide-react";

interface FeaturesAction {
  label: string,
  onClick: () => void
}

interface TableAction {
  generalLabel: string,
  icon: React.ReactNode
  features: FeaturesAction[]
}

export function TableSection({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null
  }

  const configActions: TableAction[] = [
    {
      generalLabel: "Insert",
      icon: <Grid2X2Plus className="size-4" />,
      features:
        [
          {
            label: "Insert row before",
            onClick: () => editor.chain().focus().addRowBefore().run()
          },
          {
            label: "Insert row after",
            onClick: () => editor.chain().focus().addRowAfter().run()
          },
          {
            label: "Insert column before",
            onClick: () => editor.chain().focus().addColumnBefore().run()
          },
          {
            label: "Insert column after",
            onClick: () => editor.chain().focus().addColumnAfter().run()
          }
        ]
    },
    {
      generalLabel: "Delete",
      icon: <Grid2X2X className="size-4" />,
      features:
        [
          {
            label: "Delete row",
            onClick: () => editor.chain().focus().deleteRow().run()
          },
          {
            label: "Delete column",
            onClick: () => editor.chain().focus().deleteColumn().run()
          },
          {
            label: "Delete table",
            onClick: () => editor.chain().focus().deleteTable().run()
          }
        ]
    },
    {
      generalLabel: "More settings",
      icon: <Settings2 className="size-4" />,
      features:
        [
          {
            label: "Merge cells",
            onClick: () => editor.chain().focus().mergeCells().run()
          },
          {
            label: "Split cell",
            onClick: () => editor.chain().focus().splitCell().run()
          },
          {
            label: "Toggle header row",
            onClick: () => editor.chain().focus().toggleHeaderRow().run()
          },
          {
            label: "Toggle header column",
            onClick: () => editor.chain().focus().toggleHeaderColumn().run()
          },
        ]
    }
  ]

  const renderMenuItem = ({ label, onClick }: FeaturesAction) => {
    return (
      <DropdownMenuItem
        key={label}
        onClick={onClick}
        className="cursor-pointer"
      >
        {label}
      </DropdownMenuItem>
    )
  }

  const renderGroupItem = ({ generalLabel, icon, features }: TableAction) => {
    return (
      <DropdownMenuGroup key={generalLabel}>
        <DropdownMenuLabel className="flex items-center font-bold gap-2">
          {icon} {generalLabel}
        </DropdownMenuLabel>

        {features.map((action) => (
          renderMenuItem(action))
        )}
      </DropdownMenuGroup>
    )
  }

  return (
    <>
      <ToggleTooltip
        tooltip="3x3 Table"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <Grid3x3 className="size-4" />
      </ToggleTooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToggleTooltip
            tooltip="Table Settings"
            disabled={!editor.isActive("table")}
          >
            <Columns3Cog className="size-4" />
          </ToggleTooltip>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-full max-h-[225px] border border-black">
          {configActions.map((action) =>
            renderGroupItem(action)
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}