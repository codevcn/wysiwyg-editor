import { EToolbarAction, EBlockquoteType } from "@/enums/global-enums.js"
import { TToolbarAction } from "@/types/global-types.js"
import { html } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"
import { ToolbarButton } from "../toolbar-button.js"
import { blockquoteStylish } from "./blockquote-stylish.js"
import { CodeVCNEditorHelper } from "../../helpers/codevcn-editor-helper.js"

class BlockquoteModule {
  private sectionElement: HTMLElement
  private actions: TToolbarAction[] = [
    {
      action: EToolbarAction.BLOCKQUOTE,
      label: `<i class="bi bi-quote text-xl"></i>`,
      type: "button",
    },
  ]

  constructor() {
    this.sectionElement = this.initSectionElement()
    this.bindEvents()
  }

  private initSectionElement(): HTMLElement {
    const Renderer = () =>
      html`<div class="NAME-blockquote-module flex gap-2">
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
    return CodeVCNEditorHelper.createFromRenderer(Renderer)
  }

  getSectionElement(): HTMLElement {
    return this.sectionElement
  }

  private bindButtonEvents() {
    const buttons = this.sectionElement.querySelectorAll<HTMLElement>(".NAME-toolbar-btn")
    buttons.forEach((btn) => {
      const tb = new ToolbarButton<EBlockquoteType>(btn)
      tb.onClick((action) => {
        this.onAction(action)
      })
    })
  }

  private bindEvents() {
    this.bindButtonEvents()
  }

  onAction(action: EBlockquoteType) {
    blockquoteStylish.onAction(action)
  }
}

export const blockquoteModule = new BlockquoteModule()
