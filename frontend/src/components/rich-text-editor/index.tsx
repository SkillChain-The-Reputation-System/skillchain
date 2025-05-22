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
import { Mathematics } from '@tiptap-pro/extension-mathematics'
import FileHandler from '@tiptap-pro/extension-file-handler'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

import LangSelector from '@/components/rich-text-editor/lang-selector'
import { all, createLowlight } from 'lowlight'

const lowlight = createLowlight(all)

import 'katex/dist/katex.min.css'

interface RichTextEditorProps {
  value?: Content,
  onChange?: (value: Content) => void,
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
        Mathematics,
        FileHandler.configure({
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
          onDrop: (currentEditor, files, pos) => {
            files.forEach(file => {
              const fileReader = new FileReader()

              fileReader.readAsDataURL(file)
              fileReader.onload = () => {
                currentEditor.chain().insertContentAt(pos, {
                  type: 'image',
                  attrs: {
                    src: fileReader.result,
                  },
                }).focus().run()
              }
            })
          },
          onPaste: (currentEditor, files, htmlContent) => {
            files.forEach(file => {
              if (htmlContent) {
                // if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
                // you could extract the pasted file from this url string and upload it to a server for example
                console.log(htmlContent) // eslint-disable-line no-console
                return false
              }

              const fileReader = new FileReader()

              fileReader.readAsDataURL(file)
              fileReader.onload = () => {
                currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, {
                  type: 'image',
                  attrs: {
                    src: fileReader.result,
                  },
                }).focus().run()
              }
            })
          },
        }),
      ],
      editorProps: {
        attributes: {
          class: className
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
    <div>
      {editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} className='editor' spellCheck={false} />
    </div>
  );
}