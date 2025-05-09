'use client'

// Import hooks
import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react'

// Import TipTap extensions
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './menu-bar';
import TextAlign from '@tiptap/extension-text-align'
import Highlight from "@tiptap/extension-highlight";
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Mathematics } from '@tiptap-pro/extension-mathematics'

import 'katex/dist/katex.min.css'

interface RichTextEditorProps {
  value: string,
  onChange: (value: string) => void,
  className?: string,
  placeholder?: string,
  editable?: boolean
}

export default function RichTextEditor({ value, onChange, className = "", placeholder = "Write something...", editable = true }: RichTextEditorProps) {
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
        TextAlign.configure(
          {
            types: ['heading', 'paragraph'],
          }
        ),
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
        Mathematics
      ],
      content: value,
      editorProps: {
        attributes: {
          class: className
        }
      },
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      editable: editable,
    }
  )

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value])

  return (
    <div>
      {editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} className='editor' spellCheck={false} />
    </div>
  );
}