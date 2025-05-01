'use client'

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './menu-bar';
import TextAlign from '@tiptap/extension-text-align'
import Highlight from "@tiptap/extension-highlight";
import Placeholder from '@tiptap/extension-placeholder'

interface RichTextEditorProps {
  value: string,
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder = "Write something..." }: RichTextEditorProps) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure(
          {
            bulletList: {
              HTMLAttributes: {
                class: 'list-disc ml-3',
              }
            },
            orderedList: {
              HTMLAttributes: {
                class: "list-decimal ml-3",
              },
            },
          }
        ),
        TextAlign.configure(
          {
            types: ['heading', 'paragraph'],
          }
        ),
        Highlight,
        Placeholder.configure({
          placeholder: placeholder,
        })
      ],
      content: value,
      editorProps: {
        attributes: {
          class: "min-h-[156px] border rounded-md bg-slate-50 py-2 px-3 dark:bg-blue-950/15"
        }
      },
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML())
      },
    }
  )

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value])

  return (
    <div className='overflow-hidden'>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>);
}