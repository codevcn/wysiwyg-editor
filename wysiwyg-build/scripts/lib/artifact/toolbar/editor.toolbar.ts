import { html } from "lit-html"
import { textStylingModule } from "./text-styling/text-styling.module.js"
import { textListingModule } from "./text-listing/text-listing.module.js"
import { blockquoteModule } from "./text-blocking/blockquote/blockquote.module.js"
import { imageBlockingModule } from "./image-blocking/image-blocking.module.js"
import { LitHTMLHelper } from "@/helpers/common-helpers.js"
import { textLinkingModule } from "./text-linking/text-linking.module.js"
import { codeBlockingModule } from "./code-blocking/code-blocking.module.js"
import { textHeadingModule } from "./text-heading/text-heading.module.js"
import { tablePlacingModule } from "./table-placing/table-placing.module.js"

class EditorToolbar {
  private toolbarElement: HTMLElement
  private toolbarElementClassName: string = "NAME-editor-toolbar"

  constructor() {
    this.toolbarElement = this.createToolbarElement()
    this.registerModules()
  }

  private registerModules() {
    this.toolbarElement.appendChild(textStylingModule.getSectionElement())
    this.toolbarElement.appendChild(textHeadingModule.getSectionElement())
    this.toolbarElement.appendChild(textListingModule.getSectionElement())
    this.toolbarElement.appendChild(blockquoteModule.getSectionElement())
    this.toolbarElement.appendChild(imageBlockingModule.getSectionElement())
    this.toolbarElement.appendChild(textLinkingModule.getSectionElement())
    this.toolbarElement.appendChild(codeBlockingModule.getSectionElement())
    this.toolbarElement.appendChild(tablePlacingModule.getSectionElement())
  }

  private createToolbarElement(): HTMLElement {
    const Renderer = () =>
      html`<div class="${this.toolbarElementClassName} border-b px-2 py-1 flex gap-2 items-stretch"></div>`
    return LitHTMLHelper.createElementFromRenderer(Renderer, [])
  }

  getToolbarElement(): HTMLElement {
    return this.toolbarElement
  }
}

export const editorToolbar = new EditorToolbar()
