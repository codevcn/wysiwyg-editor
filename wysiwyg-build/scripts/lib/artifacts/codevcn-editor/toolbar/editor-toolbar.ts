import { html } from "lit-html"
import { HTMLElementHelper } from "@/utils/helpers.js"
import { textStylingModule } from "./text-styling/text-styling-module"

class EditorToolbar {
  private toolbarEl: HTMLElement

  constructor() {
    this.toolbarEl = this.initToolbarEl()
    this.toolbarEl.appendChild(textStylingModule.getSectionElement())
  }

  private initToolbarEl(): HTMLElement {
    const Renderer = () => html`<div class="editor-toolbar border-b p-2 flex gap-2"></div>`
    return HTMLElementHelper.createFromRenderer(Renderer)
  }

  public getToolbarElement(): HTMLElement {
    return this.toolbarEl
  }
}

export const editorToolbar = new EditorToolbar()
