import { html } from "lit-html"

type TCustomCodeBlockProps = {
  classNames: Partial<{
    container: string
  }>
}

export const CodeBlock = ({ classNames }: TCustomCodeBlockProps) => {
  return html`<div class="NAME-code-block ${classNames?.container || ""}"></div>`
}
