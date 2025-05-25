import { Editor } from "@tiptap/react";

// Import features UI
import { HeadingSection } from "@/components/rich-text-editor/menus/heading-section"
import { TextDecorationSection } from "@/components/rich-text-editor/menus/text-decoration-section"
import { ListingSection } from "@/components/rich-text-editor/menus/listing-section"
import { TableSection } from "@/components/rich-text-editor/menus/table-section";
import { FunctionalitySection } from "@/components/rich-text-editor/menus/functionality-section";
import { ImageUploader } from '@/components/rich-text-editor/menus/image-uploader'
import { Hyperlink } from "@/components/rich-text-editor/menus/hyperlink";

export default function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null
  }

  return (
    <div className="border-gray-300 dark:border-gray-300/30 w-full rounded-md border bg-transparent p-1 mb-1 shadow-xs transition-[color,box-shadow] outline-none space-x-2">
      <HeadingSection editor={editor} />

      <TextDecorationSection editor={editor} />

      <ListingSection editor={editor} />

      <TableSection editor={editor} />

      <FunctionalitySection editor={editor} />

      <ImageUploader editor={editor} />

      <Hyperlink editor={editor} />
    </div>
  )
}