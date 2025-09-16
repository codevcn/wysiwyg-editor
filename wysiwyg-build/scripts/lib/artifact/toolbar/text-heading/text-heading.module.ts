import { html } from "lit-html"
import { ToolbarButton } from "../toolbar-button.js"
import { repeat } from "lit-html/directives/repeat.js"
import { textHeadingStylish } from "./text-heading.stylish.js"
import { ETextHeadingType, EToolbarAction } from "@/enums/global-enums.js"
import type { TToolbarAction } from "@/types/global-types.js"
import { DropdownManager } from "@/lib/components/managers/dropdown.manager.js"
import { LitHTMLHelper } from "@/helpers/common-helpers.js"
import { DropdownTrigger } from "@/lib/components/dropdown.js"

class TextHeadingModule {
  private sectionElement: HTMLElement
  private actions: TToolbarAction[] = [
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
      className: "text-2xl font-bold",
      options: [
        {
          value: ETextHeadingType.PARAGRAPH,
          label: "Paragraph",
          className: "text-base",
        },
        {
          value: ETextHeadingType.HEADING_1,
          label: "H1",
          className: "text-2xl font-bold",
        },
        {
          value: ETextHeadingType.HEADING_2,
          label: "H2",
          className: "text-xl font-bold",
        },
        {
          value: ETextHeadingType.HEADING_3,
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
      html`<div class="NAME-text-heading-section flex gap-2">
        ${repeat(
          this.actions,
          ({ action }) => action,
          ({ action, label, className, options }) =>
            options
              ? DropdownTrigger({
                  action,
                  label,
                  classNames: { btn: className },
                  initialValue: options?.[0]?.value || "",
                })
              : ""
        )}
      </div>`
    return LitHTMLHelper.createElementFromRenderer(Renderer, [])
  }

  private bindButtonEvents() {
    const buttons = this.sectionElement.querySelectorAll<HTMLElement>(".NAME-toolbar-btn")
    buttons.forEach((btn) => {
      const tb = new ToolbarButton<ETextHeadingType>(btn)
      tb.onClick((action) => {
        this.onAction(action as ETextHeadingType)
      })
    })
  }

  private bindDropdownEvents() {
    const triggers = this.sectionElement.querySelectorAll<HTMLElement>(".NAME-dropdown-trigger")
    for (const trigger of triggers) {
      DropdownManager.bindShowDropdownMenuEventToTrigger(
        trigger,
        [
          {
            options: this.actions.find(({ action }) => action === trigger.dataset.action)?.options || [],
          },
        ],
        (activeValue) => {
          this.onAction(activeValue as ETextHeadingType)
        }
      )
    }
  }

  private bindEvents() {
    this.bindButtonEvents()
    this.bindDropdownEvents()
  }

  private onAction(headingType: ETextHeadingType) {
    queueMicrotask(() => {
      textHeadingStylish.onAction(headingType)
    })
  }
}

export const textHeadingModule = new TextHeadingModule()
