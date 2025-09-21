import { html, type TemplateResult } from "lit-html"

type TCustomPopoverProps = {
  content: TemplateResult<1>
} & Partial<{
  id: string
}>

export const Popover = ({ content, id }: TCustomPopoverProps) => {
  return html`
    <div class="NAME-popover fixed z-[99] top-0 left-0 pt-1.5" ?id=${id}>
      <div class="NAME-popover-content-wrapper bg-white border border-gray-400 shadow-md rounded-md relative">
        <div
          class="NAME-popover-arrow bg-inherit border border-inherit h-2 w-2 rotate-45 absolute -top-1 left-1/2 -translate-x-1/2 z-10"
        ></div>
        <div class="NAME-popover-content relative z-20 bg-inherit rounded-md">${content}</div>
      </div>
    </div>
  `
}
