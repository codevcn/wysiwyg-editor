import { html } from "lit-html"
import { LitHTMLHelper } from "@/helpers/common-helpers.js"

class EditorFrame {
  private frameElement: HTMLElement
  private frameElementClassName: string = "NAME-editor-frame"
  private codevcnEditorClassName: string = "NAME-codevcn-editor"

  constructor() {
    this.frameElement = this.createFrameElement()
  }

  private createFrameElement(): HTMLElement {
    const Renderer = () =>
      html`<div
        class="${this.frameElementClassName} ${this
          .codevcnEditorClassName} w-full max-w-3xl mx-auto border rounded-lg shadow bg-white"
      ></div>`
    return LitHTMLHelper.createFromRenderer(Renderer)
  }

  getFrameElement(): HTMLElement {
    return this.frameElement
  }
}

export const editorFrame = new EditorFrame()
