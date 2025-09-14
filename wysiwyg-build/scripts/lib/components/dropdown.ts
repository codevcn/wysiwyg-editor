import { html, type TemplateResult } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"

type TCustomDropDownProps = {
  options: ({
    value: string
    label: string
  } & Partial<{
    className: string
  }>)[]
} & Partial<{
  classNames: Partial<{
    btn: string
    container: string
  }>
}>

export const DropdownMenu = ({ options, classNames }: TCustomDropDownProps): TemplateResult<1> => {
  return html`
    <div class="NAME-dropdown-menu fixed top-0 left-0">
      <div
        class="NAME-dropdown-menu-options flex flex-col gap-1 rounded-lg duration-200 ease-in-out bg-white border border-regular-border-cl z-50 p-1.5 ${classNames?.container ||
        ""}"
      >
        ${options && options.length > 0
          ? repeat(
              options,
              ({ value }) => value,
              ({ value, label, className }) =>
                html`
                  <button
                    class="NAME-dropdown-option flex items-center px-1.5 py-0.5 leading-[1.5] w-full cursor-pointer rounded ${className ||
                    ""}"
                    data-value="${value}"
                  >
                    ${unsafeHTML(label)}
                  </button>
                `
            )
          : ""}
      </div>
    </div>
  `
}

type TCustomDropDownTriggerProps = {
  label: string
  action: string
} & Partial<{
  initialValue: string
  classNames: Partial<{
    btn: string
    container: string
  }>
}>

export const DropdownTrigger = ({
  label,
  classNames,
  initialValue,
  action,
}: TCustomDropDownTriggerProps): TemplateResult<1> => {
  return html`
    <div
      class="NAME-dropdown-trigger flex items-center px-2 py-1 leading-none rounded hover:bg-gray-200 cursor-pointer h-full ${classNames?.container ||
      ""}"
      ?data-value=${initialValue}
      data-action=${action}
    >
      <button
        class="NAME-dropdown-btn flex items-center px-2 py-1 leading-none rounded hover:bg-gray-200 cursor-pointer h-full ${classNames?.btn ||
        ""}"
      >
        ${unsafeHTML(label)}
      </button>
    </div>
  `
}
