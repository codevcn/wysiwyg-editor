import { html } from "lit-html"
import { HTMLElementHelper } from "@/utils/helpers.js"
import { textListingStylish } from "../toolbar/text-listing/text-listing-stylish"

class EditorContent {
  private contentElement: HTMLElement
  private contentElementName: string = "NAME-editor-content"
  private topBlockElementTagName: string = "P"

  constructor() {
    this.contentElement = this.initContentEl()
    this.initEventListeners()
  }

  getContentElementName(): string {
    return this.contentElementName
  }

  private initContentEl(): HTMLElement {
    const Renderer = () =>
      html`
        <div
          class="${this.contentElementName} p-4 min-h-[300px] outline-none"
          contenteditable="true"
          spellcheck="false"
        ></div>
      `
    return HTMLElementHelper.createFromRenderer(Renderer)
  }

  bindKeydownEventListener(): void {
    this.contentElement.addEventListener("keydown", (e) => {
      queueMicrotask(() => {
        textListingStylish.onAction(undefined, e)
      })
    })
  }

  initEventListeners(): void {
    this.bindKeydownEventListener()
  }

  getContentElement(): HTMLElement {
    return this.contentElement
  }

  checkIsFocusingInEditorContent(): Selection | null {
    const selection = window.getSelection()
    if (!selection) return null
    const anchorNode = selection.anchorNode
    if (!anchorNode) return null
    if (!this.contentElement.contains(anchorNode)) return null
    return selection
  }

  insertNewTopBlockElementAndFocusCaret(): HTMLElement {
    const topBlockElement = document.createElement(this.topBlockElementTagName)
    topBlockElement.innerHTML = "<br>"
    this.contentElement.appendChild(topBlockElement)

    // Focus caret vào content của top block element mới tạo
    const range = document.createRange()
    range.selectNodeContents(topBlockElement)
    range.collapse(true)
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
    }

    this.contentElement.focus()

    return topBlockElement
  }
}

export const editorContent = new EditorContent()
