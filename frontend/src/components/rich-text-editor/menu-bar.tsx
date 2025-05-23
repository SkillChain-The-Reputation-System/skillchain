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
    <div className="max-w-5xl border-1 border-black dark:border-white rounded-md p-1 mb-1 bg-slate-50 dark:bg-blue-950/15 space-x-2 z-50">
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