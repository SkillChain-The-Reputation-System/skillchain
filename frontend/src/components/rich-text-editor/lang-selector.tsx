import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export default function LangSelector(
  {
    editor,
    node: { attrs: { language } },
    updateAttributes,
    extension,
  }: NodeViewProps
) {

  return (
    <NodeViewWrapper className="relative">
      {editor.isEditable && (
        <select
          className="absolute rounded-md top-[0.5rem] right-[0.5rem] p-[0.2rem] bg-white dark:bg-black text-sm border border-gray-300 dark:border-gray-600 shadow-sm"
          contentEditable={false}
          defaultValue={language}
          onChange={event => updateAttributes({ language: event.target.value })}
        >
          <option value="null">
            auto
          </option>
          <option disabled>
            —
          </option>
          {extension.options.lowlight.listLanguages().map((lang: string, index: number) => (
            <option key={index} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      )}

      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}