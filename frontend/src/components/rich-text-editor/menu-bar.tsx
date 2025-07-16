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
    <div className="
      bg-[var(--rte-menubar-bg)] 
      border-b border-[var(--rte-menubar-border)]
      px-3 py-2
      flex items-center gap-1 flex-wrap
      transition-colors duration-200
      overflow-x-auto scrollbar-thin
      max-w-full min-w-0
      whitespace-nowrap
    ">
      <div className="flex items-center gap-1 flex-wrap min-w-0">
        <HeadingSection editor={editor} />

        <div className="w-px h-6 bg-[var(--rte-menubar-border)] mx-1 flex-shrink-0" />

        <TextDecorationSection editor={editor} />

        <div className="w-px h-6 bg-[var(--rte-menubar-border)] mx-1 flex-shrink-0" />

        <ListingSection editor={editor} />

        <div className="w-px h-6 bg-[var(--rte-menubar-border)] mx-1 flex-shrink-0" />

        <TableSection editor={editor} />

        <div className="w-px h-6 bg-[var(--rte-menubar-border)] mx-1 flex-shrink-0" />

        <FunctionalitySection editor={editor} />

        <div className="w-px h-6 bg-[var(--rte-menubar-border)] mx-1 flex-shrink-0" />

        <ImageUploader editor={editor} />

        <div className="w-px h-6 bg-[var(--rte-menubar-border)] mx-1 flex-shrink-0" />

        <Hyperlink editor={editor} />
      </div>
    </div>
  )
}