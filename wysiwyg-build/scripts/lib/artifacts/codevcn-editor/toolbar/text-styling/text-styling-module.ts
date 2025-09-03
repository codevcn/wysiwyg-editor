import { html } from "lit-html"
import { ToolbarButton } from "../toolbar-button.js"
import { repeat } from "lit-html/directives/repeat.js"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"
import { HTMLElementHelper } from "@/utils/helpers.js"
import { textStylingStylish } from "./text-styling-stylish.js"
import { ETextStylingType } from "@/enums/global-enums.js"
import type { TToolbarAction } from "@/types/global-types"
import { editorContent } from "../../content/editor-content.js"

class TextStylingModule {
  private sectionElement: HTMLElement
  private actions: TToolbarAction[] = [
    {
      command: ETextStylingType.BOLD,
      label: "B",
      type: "button",
      className: "font-bold",
    },
    {
      command: ETextStylingType.ITALIC,
      label: "I",
      type: "button",
      className: "italic font-mono text-lg",
    },
    {
      command: ETextStylingType.UNDERLINE,
      label: "U",
      type: "button",
      className: "underline",
    },
    {
      command: ETextStylingType.STRIKE_THROUGH,
      label: "S",
      type: "button",
      className: "line-through",
    },
  ]

  constructor() {
    this.sectionElement = this.initSectionElement()
    this.bindEvents()
  }

  getSectionElement(): HTMLElement {
    return this.sectionElement
  }

  private initSectionElement(): HTMLElement {
    const Renderer = () =>
      html`<div class="NAME-text-styling-section flex gap-2">
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

  private bindButtonEvents() {
    const buttons = this.sectionElement.querySelectorAll<HTMLElement>(".NAME-toolbar-btn")
    buttons.forEach((btn) => {
      const tb = new ToolbarButton(btn)
      tb.onClick((cmd) => {
        this.onAction(cmd as ETextStylingType)
      })
    })
  }

  private bindEvents() {
    this.bindButtonEvents()
  }

  onAction(stylingType: ETextStylingType) {
    queueMicrotask(() => {
      textStylingStylish.onAction(stylingType)
    })
  }
}

export const textStylingModule = new TextStylingModule()
