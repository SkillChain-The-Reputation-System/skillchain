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
      <Popover>
        <PopoverTrigger asChild>
          <Toggle pressed={editor.isActive("link")}>
            <Link className="size-4" />
          </Toggle>
        </PopoverTrigger>

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

      {editor.isActive("link") && (
        <Toggle pressed={editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}>
          <Unlink className="size-4" />
        </Toggle>
      )}
    </>
  )
}