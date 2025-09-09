import { html } from "lit-html"
import type { TToolbarAction } from "@/types/global-types.js"
import { ETextListingType, EToolbarAction } from "@/enums/global-enums.js"
import { repeat } from "lit-html/directives/repeat.js"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"
import { ToolbarButton } from "../toolbar-button.js"
import { textListingStylish } from "./text-listing.stylish.js"
import { LitHTMLHelper } from "@/helpers/common-helpers.js"

class TextListingModule {
  private sectionElement: HTMLElement
  private actions: TToolbarAction[] = [
    {
      action: EToolbarAction.NUMBERED_LIST,
      label: `<i class="bi bi-list-ol"></i>`,
      type: "button",
      className: "text-2xl font-bold",
    },
    {
      action: EToolbarAction.BULLET_LIST,
      label: `<i class="bi bi-list-ul"></i>`,
      type: "button",
      className: "text-2xl font-bold",
    },
  ]

  constructor() {
    this.sectionElement = this.createSectionElement()
    this.bindEvents()
  }

  private createSectionElement(): HTMLElement {
    const Renderer = () => html`<div class="NAME-text-listing-section flex gap-2">
      ${repeat(
        this.actions,
        (action) => action.action,
        (action) =>
          html`<button
            class="NAME-toolbar-btn flex items-center px-2 py-1 leading-none rounded hover:bg-gray-200 cursor-pointer ${action.className}"
            data-action="${action.action}"
          >
            ${unsafeHTML(action.label)}
          </button>`
      )}
    </div>`
    return LitHTMLHelper.createFromRenderer(Renderer, [])
  }

  getSectionElement(): HTMLElement {
    return this.sectionElement
  }

  private bindButtonEvents() {
    const buttons = this.sectionElement.querySelectorAll<HTMLElement>(".NAME-toolbar-btn")
    buttons.forEach((btn) => {
      const tb = new ToolbarButton<ETextListingType>(btn)
      tb.onClick((action) => {
        this.onAction(action)
      })
    })
  }

  private bindEvents() {
    this.bindButtonEvents()
  }

  private onAction(listingType: ETextListingType) {
    queueMicrotask(() => {
      textListingStylish.onAction(listingType)
    })
  }
}

export const textListingModule = new TextListingModule()
