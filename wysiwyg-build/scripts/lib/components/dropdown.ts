import { html, type TemplateResult } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"
import { ifDefined } from "lit-html/directives/if-defined.js"

type TCustomDropDownProps = {
  label: string
  options: {
    value: string
    label: string
  }[]
} & Partial<{
  dataObject: Record<string, string>
  classNames: Partial<{
    btn: string
    options: string[]
    container: string
  }>
}>

export const DropDown = ({ label, options, dataObject, classNames }: TCustomDropDownProps): TemplateResult<1> => {
  return html`
    <div
      class="NAME-custom-dropdown ${classNames?.container || ""}"
      data-value="${options[0].value}"
      data-object=${ifDefined(dataObject ? JSON.stringify(dataObject) : null)}
    >
      <button class="NAME-custom-dropdown-btn ${classNames?.btn || ""}">${unsafeHTML(label)}</button>
      <div class="NAME-custom-dropdown-content">
        ${repeat(
          options,
          ({ value }) => value,
          ({ value, label }, index) =>
            html`
              <button class="NAME-custom-dropdown-option ${classNames?.options?.[index] || ""}" data-value="${value}">
                ${unsafeHTML(label)}
              </button>
            `
        )}
      </div>
    </div>
  `
}
