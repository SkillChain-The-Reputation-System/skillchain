// Import hooks
import { Editor } from "@tiptap/react";

// Import Lucide-react Icons
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline
} from "lucide-react";

// Import UI components
import { Toggle } from "../ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ImageUploader } from './image-uploader'
import { Hyperlink } from "./hyperlink";

export default function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null
  }

  const Options = [
    {
      icon: <Heading1 className="size-4" />,
      tooltip: "Heading 1",
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      preesed: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="size-4" />,
      tooltip: "Heading 2",
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      preesed: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3 className="size-4" />,
      tooltip: "Heading 3",
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      preesed: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: <Bold className="size-4" />,
      tooltip: "Bold",
      onClick: () => editor.chain().focus().toggleBold().run(),
      preesed: editor.isActive("bold"),
    },
    {
      icon: <Italic className="size-4" />,
      tooltip: "Italic",
      onClick: () => editor.chain().focus().toggleItalic().run(),
      preesed: editor.isActive("italic"),
    },
    {
      icon: <Underline className="size-4" />,
      tooltip: "Underline",
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      preesed: editor.isActive("underline"),
    },
    {
      icon: <Strikethrough className="size-4" />,
      tooltip: "Strike",
      onClick: () => editor.chain().focus().toggleStrike().run(),
      preesed: editor.isActive("strike"),
    },
    {
      icon: <Quote className="size-4" />,
      tooltip: "Blockquote",
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      preesed: editor.isActive("blockquote"),
    },
    {
      icon: <AlignLeft className="size-4" />,
      tooltip: "Align Left",
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      preesed: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: <AlignCenter className="size-4" />,
      tooltip: "Align Center",
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      preesed: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: <AlignRight className="size-4" />,
      tooltip: "Align Right",
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      preesed: editor.isActive({ textAlign: "right" }),
    },
    {
      icon: <List className="size-4" />,
      tooltip: "Bullet List",
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      preesed: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="size-4" />,
      tooltip: "Ordered List",
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      preesed: editor.isActive("orderedList"),
    },
    {
      icon: <Highlighter className="size-4" />,
      tooltip: "Hightlight",
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      preesed: editor.isActive("highlight"),
    },
    {
      icon: <Code className="size-4" />,
      tooltip: "Code Block",
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      pressed: editor.isActive('codeBlock')
    }
  ];

  return (
    <div className="border-1 border-black dark:border-white rounded-md p-1 mb-1 bg-slate-50 dark:bg-blue-950/15 space-x-2 z-50">
      {Options.map((option, index) => (
        <TooltipProvider key={index} >
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle pressed={option.preesed} onPressedChange={option.onClick}>
                {option.icon}
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              {option.tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      <ImageUploader editor={editor} />
      <Hyperlink editor={editor} />
    </div>
  )
}