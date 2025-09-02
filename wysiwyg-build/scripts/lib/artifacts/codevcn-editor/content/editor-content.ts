import { html } from "lit-html"
import { HTMLElementHelper } from "@/utils/helpers.js"

class EditorContent {
  private contentEl: HTMLElement

  constructor() {
    this.contentEl = this.initContentEl()
  }

  private initContentEl(): HTMLElement {
    const Renderer = () =>
      html`
        <div class="editor-content p-4 min-h-[300px] outline-none" contenteditable="true" spellcheck="false"></div>
      `
    return HTMLElementHelper.createFromRenderer(Renderer)
  }

  public getContentElement(): HTMLElement {
    return this.contentEl
  }
}

export const editorContent = new EditorContent()
