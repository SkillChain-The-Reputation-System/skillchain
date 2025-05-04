// Import hooks
import { useState } from 'react';
import { Editor } from "@tiptap/react";

// Import Lucide-react Icons
import { Link, Unlink } from 'lucide-react'

// Import UI components
import { Toggle } from '@/components/ui/toggle';
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Hyperlink({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null
  }

  const [linkText, setLinkText] = useState("");

  const setLink = () => {
    if (linkText) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkText }).run();
      setLinkText("");
    }
  }

  return (
    <>
      <TooltipProvider>
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Toggle pressed={editor.isActive("link")}>
                  <Link className="size-4" />
                </Toggle>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              Hyperlink
            </TooltipContent>
          </Tooltip>

          <PopoverContent className="min-w-md border-2 border-black dark:border-white space-y-4">
            <Label><strong>Insert Hyperlink</strong></Label>
            <Input
              className='border-gray-400 dark:border-white border-1'
              placeholder='https://'
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
            />
            <Button onClick={setLink}>Add link</Button>
          </PopoverContent>
        </Popover>
      </TooltipProvider>

      {editor.isActive("link") && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle pressed={editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}>
                <Unlink className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              Remove Hyperlink
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  )
}