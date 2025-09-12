import { ECodeBlockingType, EToolbarAction } from "@/enums/global-enums"
import { LitHTMLHelper } from "@/helpers/common-helpers.js"
import { TToolbarAction } from "@/types/global-types"
import { html } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"
import { ToolbarButton } from "../toolbar-button.js"
import { codeBlockingManager } from "./code-blocking.manager.js"

class CodeBlockingModule {
  private sectionElement: HTMLElement
  private actions: TToolbarAction[] = [
    {
      action: EToolbarAction.CODE_BLOCKING,
      label: `<i class="bi bi-code-square text-lg"></i>`,
      type: "button",
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
      html`<div class="NAME-code-blocking-module flex gap-2">
        ${repeat(
          this.actions,
          ({ action }) => action,
          ({ action, label, className }) =>
            html`<button
              class="NAME-toolbar-btn flex items-center px-2 py-1 leading-none rounded hover:bg-gray-200 cursor-pointer ${className}"
              data-action="${action}"
            >
              ${unsafeHTML(label)}
            </button>`
        )}
      </div>`
    return LitHTMLHelper.createFromRenderer(Renderer, [])
  }

  private bindEvents() {
    const buttons = this.sectionElement.querySelectorAll<HTMLElement>(".NAME-toolbar-btn")
    buttons.forEach((btn) => {
      const tb = new ToolbarButton<ECodeBlockingType>(btn)
      tb.onClick((action) => {
        this.onAction(action)
      })
    })
  }

  private onAction(action: ECodeBlockingType) {
    queueMicrotask(() => {
      switch (action) {
        case ECodeBlockingType.CODE_BLOCKING:
          codeBlockingManager.insertCodeBlockForEditing()
          break
      }
    })
  }
}

export const codeBlockingModule = new CodeBlockingModule()
