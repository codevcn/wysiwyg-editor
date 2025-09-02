import { html } from "lit-html"
import { HTMLElementHelper } from "@/utils/helpers.js"

class EditorFrame {
  private frameEl: HTMLElement

  constructor() {
    this.frameEl = this.initFrameEl()
  }

  private initFrameEl(): HTMLElement {
    const Renderer = () =>
      html`<div class="editor-frame w-full max-w-3xl mx-auto border rounded-lg shadow bg-white"></div>`
    return HTMLElementHelper.createFromRenderer(Renderer)
  }

  public getFrameElement(): HTMLElement {
    return this.frameEl
  }
}

export const editorFrame = new EditorFrame()
