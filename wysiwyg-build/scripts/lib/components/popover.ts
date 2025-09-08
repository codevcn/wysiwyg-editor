import { html, type TemplateResult } from "lit-html"

type TCustomPopoverProps = {
  content: TemplateResult<1>
}

export const Popover = ({ content }: TCustomPopoverProps) => {
  return html`
    <div class="NAME-popover fixed z-[80] top-0 left-0">
      <div class="NAME-popover-content">${content}</div>
    </div>
  `
}
