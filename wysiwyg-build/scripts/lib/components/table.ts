import { html, type TemplateResult } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"
import { ifDefined } from "lit-html/directives/if-defined.js"

type TableProps = {
  rows: {
    key: string
    rowClassName?: string
    cells: {
      key: string
      content: TemplateResult<1>
      className?: string
    }[]
  }[]
} & Partial<{
  isInsideEditorContent?: boolean
}>

export const Table = ({ rows, isInsideEditorContent }: TableProps): TemplateResult<1> => {
  return html`<table ?class=${!isInsideEditorContent && "NAME-table"}>
    <tbody>
      ${rows &&
      repeat(
        rows,
        ({ key }) => key,
        ({ rowClassName, cells }) => html`<tr ?class=${rowClassName}>
          ${repeat(
            cells,
            ({ key }) => key,
            ({ content, className }) => html`<td ?class=${className}>${content}</td>`
          )}
        </tr>`
      )}
    </tbody>
  </table>`
}
