import { html, type TemplateResult } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"
import { ifDefined } from "lit-html/directives/if-defined.js"

type TCustomDropDownProps = {
  label: string
  options: { value: string; label: string }[]
} & Partial<{
  dataObject: Record<string, string>
  classNames: Partial<{
    btn: string
    option: string
  }>
}>

export const CustomDropDown = ({ label, options, dataObject, classNames }: TCustomDropDownProps): TemplateResult<1> => {
  return html`
    <div
      class="NAME-custom-dropdown"
      data-value="${options[0].value}"
      data-object=${ifDefined(dataObject ? JSON.stringify(dataObject) : null)}
    >
      <button class="NAME-custom-dropdown-btn ${classNames?.btn || ""}">${unsafeHTML(label)}</button>
      <div class="NAME-custom-dropdown-content">
        ${repeat(
          options,
          (option) => option.value,
          (option) =>
            html`
              <button class="NAME-custom-dropdown-option ${classNames?.option || ""}" data-value="${option.value}">
                ${unsafeHTML(option.label)}
              </button>
            `
        )}
      </div>
    </div>
  `
}
