import { html } from "lit-html"
import { textStylingModule } from "./text-styling/text-styling-module.js"
import { textListingModule } from "./text-listing/text-listing-module.js"
import { CodeVCNEditorHelper } from "../helpers/codevcn-editor-helper.js"
import { blockquoteModule } from "./blockquote/blockquote-module.js"

class EditorToolbar {
  private toolbarElement: HTMLElement
  private toolbarElementClassName: string = "NAME-editor-toolbar"

  constructor() {
    this.toolbarElement = this.initToolbarEl()
    this.toolbarElement.appendChild(textStylingModule.getSectionElement())
    this.toolbarElement.appendChild(textListingModule.getSectionElement())
    this.toolbarElement.appendChild(blockquoteModule.getSectionElement())
  }

  private initToolbarEl(): HTMLElement {
    const Renderer = () =>
      html`<div class="${this.toolbarElementClassName} border-b px-2 py-1 flex gap-2 items-stretch"></div>`
    return CodeVCNEditorHelper.createFromRenderer(Renderer)
  }

  getToolbarElement(): HTMLElement {
    return this.toolbarElement
  }
}

export const editorToolbar = new EditorToolbar()
