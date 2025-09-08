import { html } from "lit-html"
import { ToolbarButton } from "../toolbar-button.js"
import { repeat } from "lit-html/directives/repeat.js"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"
import { textStylingStylish } from "./text-styling.stylish.js"
import { ETextStylingType, EToolbarAction } from "@/enums/global-enums.js"
import type { TToolbarAction } from "@/types/global-types.js"
import { DropDown } from "@/lib/components/dropdown.js"
import { DropdownManager } from "@/lib/components/managers/dropdown.manager.js"
import { LitHTMLHelper } from "@/helpers/common-helpers.js"

class TextStylingModule {
  private sectionElement: HTMLElement
  private actions: TToolbarAction[] = [
    {
      action: EToolbarAction.BOLD,
      label: "B",
      type: "button",
      className: "font-bold",
    },
    {
      action: EToolbarAction.ITALIC,
      label: "I",
      type: "button",
      className: "italic font-mono text-lg",
    },
    {
      action: EToolbarAction.UNDERLINE,
      label: "U",
      type: "button",
      className: "underline",
    },
    {
      action: EToolbarAction.STRIKE_THROUGH,
      label: "S",
      type: "button",
      className: "line-through",
    },
    {
      action: EToolbarAction.RESIZE,
      label: `
        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#000000" height="18" width="18">
          <g data-name="Layer_2">
            <g data-name="invisible_box">
              <rect width="26" height="26" fill="none"></rect>
            </g>
            <g data-name="Q3_icons">
              <g>
                <polygon points="2 23 9 23 9 43 15 43 15 23 22 23 22 17 2 17 2 23"></polygon>
                <polygon points="46 5 14 5 14 11 27 11 27 43 33 43 33 11 46 11 46 5"></polygon>
              </g>
            </g>
          </g>
        </svg>`,
      type: "select",
      className: "text-2xl font-bold",
      options: [
        {
          value: ETextStylingType.PARAGRAPH,
          label: "Paragraph",
          className: "text-base",
        },
        {
          value: ETextStylingType.HEADING_1,
          label: "H1",
          className: "text-2xl font-bold",
        },
        {
          value: ETextStylingType.HEADING_2,
          label: "H2",
          className: "text-xl font-bold",
        },
        {
          value: ETextStylingType.HEADING_3,
          label: "H3",
          className: "text-lg font-bold",
        },
      ],
    },
  ]

  constructor() {
    this.sectionElement = this.createSectionElement()
    this.bindEvents()
  }

  getSectionElement(): HTMLElement {
    return this.sectionElement
  }

  private createSectionElement(): HTMLElement {
    const Renderer = () =>
      html`<div class="NAME-text-styling-section flex gap-2">
        ${repeat(
          this.actions,
          ({ action }) => action,
          ({ action, label, type, className, options }) =>
            type === "select"
              ? DropDown({
                  label,
                  options: options || [],
                  dataObject: {
                    action: action,
                  },
                  classNames: {
                    btn: `flex items-center px-2 py-1 leading-none rounded hover:bg-gray-200 cursor-pointer h-full ${className}`,
                    options: options?.map(
                      ({ className }) => `flex gap-2 py-1 px-2 cursor-pointer hover:bg-gray-200 ${className || ""}`
                    ),
                  },
                })
              : html`<button
                  class="NAME-toolbar-btn flex items-center px-2 py-1 leading-none rounded hover:bg-gray-200 cursor-pointer ${className}"
                  data-action="${action}"
                >
                  ${unsafeHTML(label)}
                </button>`
        )}
      </div>`
    return LitHTMLHelper.createFromRenderer(Renderer, [])
  }

  private bindButtonEvents() {
    const buttons = this.sectionElement.querySelectorAll<HTMLElement>(".NAME-toolbar-btn")
    buttons.forEach((btn) => {
      const tb = new ToolbarButton<ETextStylingType>(btn)
      tb.onClick((action) => {
        this.onAction(action as ETextStylingType)
      })
    })
  }

  private bindDropdownEvents() {
    const dropdowns = this.sectionElement.querySelectorAll<HTMLElement>(".NAME-dropdown")
    for (const dropdown of dropdowns) {
      DropdownManager.bindDropdownClickEvent(
        dropdown,
        "NAME-dropdown",
        "NAME-dropdown-btn",
        "NAME-dropdown-option",
        (activeValue) => {
          this.onAction(activeValue as ETextStylingType)
        }
      )
    }
  }

  private bindEvents() {
    this.bindButtonEvents()
    this.bindDropdownEvents()
  }

  onAction(stylingType: ETextStylingType) {
    queueMicrotask(() => {
      textStylingStylish.onAction(stylingType)
    })
  }
}

export const textStylingModule = new TextStylingModule()
