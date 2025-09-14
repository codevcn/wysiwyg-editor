import { ETextLinkingType, EToolbarAction } from "@/enums/global-enums"
import { TToolbarAction } from "@/types/global-types"
import { html } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"
import { LitHTMLHelper } from "@/helpers/common-helpers.js"
import { ToolbarButton } from "../toolbar-button.js"
import { textLinkingManager } from "./text-linking.manager.js"

class TextLinkingModule {
  private sectionElement: HTMLElement
  private actions: TToolbarAction[] = [
    {
      action: EToolbarAction.TEXT_LINKING,
      label: `<i class="bi bi-link-45deg text-xl"></i>`,
    },
  ]

  constructor() {
    this.sectionElement = this.createSectionElement()
    this.bindEvents()
  }

  private createSectionElement(): HTMLElement {
    const Renderer = () => html`<div class="NAME-text-linking-section flex gap-2">
      ${repeat(
        this.actions,
        (action) => action.action,
        (action) => html`<button
          class="NAME-toolbar-btn flex items-center px-2 py-1 leading-none rounded hover:bg-gray-200 cursor-pointer ${action.className}"
          data-action="${action.action}"
        >
          ${unsafeHTML(action.label)}
        </button>`
      )}
    </div>`
    return LitHTMLHelper.createElementFromRenderer(Renderer, [])
  }

  getSectionElement(): HTMLElement {
    return this.sectionElement
  }

  private bindButtonEvents() {
    const buttons = this.sectionElement.querySelectorAll<HTMLElement>(".NAME-toolbar-btn")
    buttons.forEach((btn) => {
      const tb = new ToolbarButton<ETextLinkingType>(btn)
      tb.onClick((action) => {
        this.onAction(action)
      })
    })
  }

  private bindEvents() {
    this.bindButtonEvents()
  }

  private onAction(action: ETextLinkingType) {
    queueMicrotask(() => {
      switch (action) {
        case ETextLinkingType.TEXT_LINKING:
          textLinkingManager.showModalOnAction()
          break
      }
    })
  }
}

export const textLinkingModule = new TextLinkingModule()
