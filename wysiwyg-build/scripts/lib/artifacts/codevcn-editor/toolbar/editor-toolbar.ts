import { html } from "lit-html"
import { HTMLElementHelper } from "@/utils/helpers.js"
import { textStylingModule } from "./text-styling/text-styling-module"
import { textListingModule } from "./text-listing/text-listing-module"

class EditorToolbar {
  private toolbarEl: HTMLElement

  constructor() {
    this.toolbarEl = this.initToolbarEl()
    this.toolbarEl.appendChild(textStylingModule.getSectionElement())
    this.toolbarEl.appendChild(textListingModule.getSectionElement())
  }

  private initToolbarEl(): HTMLElement {
    const Renderer = () => html`<div class="editor-toolbar border-b px-2 py-1 flex gap-2 items-stretch"></div>`
    return HTMLElementHelper.createFromRenderer(Renderer)
  }

  getToolbarElement(): HTMLElement {
    return this.toolbarEl
  }
}

export const editorToolbar = new EditorToolbar()
