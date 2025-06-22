// Import hooks
import { useState } from 'react';
import { Editor } from "@tiptap/react";

// Import Lucide-react Icons
import { Link, Unlink } from 'lucide-react'

// Import UI components
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import ToggleTooltip from "@/components/toggle-tooltip"

export function Hyperlink({ editor }: { editor: Editor | null }) {
  const [linkText, setLinkText] = useState("");

  if (!editor) {
    return null
  }

  const setLink = () => {
    if (linkText) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkText }).run();
      setLinkText("");
    }
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <ToggleTooltip
            tooltip="Hyperlink"
          >
            <Link className="size-4" />
          </ToggleTooltip>
        </PopoverTrigger>

        <PopoverContent className="min-w-md border-2 border-black dark:border-white space-y-4">
          <Label><strong>Insert Hyperlink</strong></Label>
          <Input
            className='border-gray-400 dark:border-white border-1'
            placeholder='https://'
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
          />
          <Button onClick={setLink} className="bg-zinc-700 hover:bg-zinc-700/60 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/60 cursor-pointer">Add link</Button>
        </PopoverContent>
      </Popover>

      {editor.isActive("link") && (
        <ToggleTooltip
          tooltip="Remove link"
          onClick={() => editor.chain().focus().unsetLink().run()}
          isActive={editor.isActive("link")}
        >
          <Unlink className="size-4" />
        </ToggleTooltip>
      )}
    </>
  )
}