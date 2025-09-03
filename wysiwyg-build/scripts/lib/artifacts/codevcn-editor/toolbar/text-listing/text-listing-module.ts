import { HTMLElementHelper } from "@/utils/helpers"
import { html } from "lit-html"
import type { TToolbarAction } from "@/types/global-types"
import { ETextListingType } from "@/enums/global-enums"
import { repeat } from "lit-html/directives/repeat.js"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"
import { ToolbarButton } from "../toolbar-button"
import { textListingStylish } from "./text-listing-stylish"
import { editorContent } from "../../content/editor-content"

class TextListingModule {
  private sectionElement: HTMLElement
  private actions: TToolbarAction[] = [
    {
      command: ETextListingType.NUMBERED_LIST,
      label: `<i class="bi bi-list-ol"></i>`,
      type: "button",
      className: "text-2xl font-bold",
    },
    {
      command: ETextListingType.BULLET_LIST,
      label: `<i class="bi bi-list-ul"></i>`,
      type: "button",
      className: "text-2xl font-bold",
    },
  ]

  constructor() {
    this.sectionElement = this.initSectionElement()
    this.bindEvents()
  }

  private initSectionElement(): HTMLElement {
    const Renderer = () => html`<div class="NAME-text-listing-section flex gap-2">
      ${repeat(
        this.actions,
        (action) => action.command,
        (action) =>
          html`<button
            class="NAME-toolbar-btn flex items-center px-2 py-1 leading-none rounded hover:bg-gray-200 cursor-pointer ${action.className}"
            data-command="${action.command}"
          >
            ${unsafeHTML(action.label)}
          </button>`
      )}
    </div>`
    return HTMLElementHelper.createFromRenderer(Renderer)
  }

  getSectionElement(): HTMLElement {
    return this.sectionElement
  }

  private bindButtonEvents() {
    const buttons = this.sectionElement.querySelectorAll<HTMLElement>(".NAME-toolbar-btn")
    buttons.forEach((btn) => {
      const tb = new ToolbarButton(btn)
      tb.onClick((cmd) => {
        this.onAction(cmd as ETextListingType)
      })
    })
  }

  private bindEvents() {
    this.bindButtonEvents()
  }

  onAction(listingType: ETextListingType) {
    queueMicrotask(() => {
      textListingStylish.onAction(listingType)
    })
  }
}

export const textListingModule = new TextListingModule()
