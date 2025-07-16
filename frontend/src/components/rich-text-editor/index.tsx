'use client'

// Import hooks
import { useEditor, EditorContent, Content, ReactNodeViewRenderer } from '@tiptap/react'

// Import TipTap extensions
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './menu-bar';
import Highlight from "@tiptap/extension-highlight";
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Typography from '@tiptap/extension-typography'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

import LangSelector from '@/components/rich-text-editor/lang-selector'
import { all, createLowlight } from 'lowlight'
import { cn } from "@/lib/utils"

const lowlight = createLowlight(all)


interface RichTextEditorProps {
  value?: Content,
  onChange?: (value: Content) => void,
  className?: string,
  placeholder?: string,
  editable?: boolean
  error?: boolean
}

export default function RichTextEditor({
  value,
  onChange,
  className = "",
  placeholder = "Write something...",
  editable = true,
  error,
}: RichTextEditorProps
) {
  const editor = useEditor(
    {
      shouldRerenderOnTransaction: true,
      extensions: [
        StarterKit.configure(
          {
            bulletList: {
              HTMLAttributes: {
                class: 'list-disc ml-4',
              }
            },
            orderedList: {
              HTMLAttributes: {
                class: "list-decimal ml-4",
              },
            },
          }
        ),
        Underline,
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        Subscript,
        Superscript,
        Typography,
        Highlight,
        Link.configure({
          openOnClick: true,
          autolink: true,
          defaultProtocol: 'https',
          protocols: ['http', 'https'],
          isAllowedUri: (url, ctx) => {
            try {
              // construct URL
              const parsedUrl = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`)

              // use default validation
              if (!ctx.defaultValidate(parsedUrl.href)) {
                return false
              }

              // disallowed protocols
              const disallowedProtocols = ['ftp', 'file', 'mailto']
              const protocol = parsedUrl.protocol.replace(':', '')

              if (disallowedProtocols.includes(protocol)) {
                return false
              }

              // only allow protocols specified in ctx.protocols
              const allowedProtocols = ctx.protocols.map(p => (typeof p === 'string' ? p : p.scheme))

              if (!allowedProtocols.includes(protocol)) {
                return false
              }

              // disallowed domains
              const disallowedDomains = ['example-phishing.com', 'malicious-site.net']
              const domain = parsedUrl.hostname

              if (disallowedDomains.includes(domain)) {
                return false
              }

              // all checks have passed
              return true
            } catch {
              return false
            }
          },
          shouldAutoLink: url => {
            try {
              // construct URL
              const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`)

              // only auto-link if the domain is not in the disallowed list
              const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com']
              const domain = parsedUrl.hostname

              return !disallowedDomains.includes(domain)
            } catch {
              return false
            }
          },
        }),
        Placeholder.configure({
          placeholder: placeholder,
        }),
        Image,
        CodeBlockLowlight.extend({
          addNodeView() {
            return ReactNodeViewRenderer(LangSelector)
          },
        })
          .configure({ lowlight }),
      ],
      editorProps: {
        attributes: {
          // Enhanced styling with strict overflow control
          class: cn(
            "w-full min-w-0 max-w-full outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200 ease-in-out",
            "overflow-hidden break-words",
            "box-border",
            editable && [
              "px-4 py-3 rounded-lg",
              "bg-[var(--rte-content-bg)] border-2 border-[var(--rte-border)]",
              "shadow-[var(--rte-shadow)]",
              "focus-within:border-[var(--rte-border-focus)] focus-within:shadow-[var(--rte-shadow-focus)]",
              "hover:border-[var(--rte-border-focus)]/60"
            ],
            !editable && "bg-transparent border-0",
            error && [
              "border-destructive focus-within:border-destructive",
              "shadow-destructive/10 focus-within:shadow-destructive/20"
            ],
            className
          )
        }
      },
      editable: editable,
      onCreate: ({ editor }) => {
        if (value && editor.isEmpty) {
          editor.commands.setContent(value)
        }
      },
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
      },
    }
  )

  return (
    <div className={cn(
      "rich-text-editor-container",
      "rounded-lg overflow-hidden",
      "bg-[var(--rte-background)]",
      "border border-[var(--rte-border)]",
      "shadow-[var(--rte-shadow)]",
      "transition-all duration-200 ease-in-out",
      "w-full max-w-full min-w-0",
      "box-border contain-layout contain-inline-size",
      editable && "hover:shadow-[var(--rte-shadow-focus)]",
      error && "border-destructive shadow-destructive/10"
    )}>
      {editable && <MenuBar editor={editor} />}
      <div className="overflow-hidden w-full max-w-full min-w-0">
        <EditorContent editor={editor} className="editor w-full max-w-full min-w-0" spellCheck={false} />
      </div>
    </div>
  );
}