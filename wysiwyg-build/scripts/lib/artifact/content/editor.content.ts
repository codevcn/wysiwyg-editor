import { html } from "lit-html"
import { textListingStylish } from "../toolbar/text-listing/text-listing.stylish.js"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper.js"
import { blockquoteStylish } from "../toolbar/text-blocking/blockquote/blockquote.stylish.js"
import { LitHTMLHelper } from "@/helpers/common-helpers.js"

class EditorContent {
  private contentElement: HTMLElement
  private contentElementName: string = "NAME-editor-content"

  constructor() {
    this.contentElement = this.createContentElement()
    this.initEventListeners()
  }

  getContentElementName(): string {
    return this.contentElementName
  }

  private createContentElement(): HTMLElement {
    const Renderer = () =>
      html`
        <div
          class="${this.contentElementName} p-4 min-h-[300px] outline-none"
          contenteditable="true"
          spellcheck="false"
        ></div>
      `
    return LitHTMLHelper.createFromRenderer(Renderer, [])
  }

  private bindKeydownEventListener(): void {
    this.contentElement.addEventListener("keydown", (e) => {
      queueMicrotask(() => {
        textListingStylish.onAction(undefined, e)
        blockquoteStylish.onAction(undefined, e)
      })
    })
  }

  /**
   * Hàm xử lý sự kiện beforeinput (hàm được gọi khi người dùng nhập chỉnh sửa content trong editor)
   */
  private bindBeforeInputEventListener(): void {
    this.contentElement.addEventListener("beforeinput", (e) => {
      if (e.inputType === "insertParagraph") {
        e.preventDefault()
        this.contentElement.appendChild(CodeVCNEditorHelper.createNewTopBlockElement())
      }
    })
  }

  private initEventListeners(): void {
    this.bindKeydownEventListener()
    this.bindBeforeInputEventListener()
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
    const topBlockElement = document.createElement(CodeVCNEditorHelper.topBlockElementTagName)
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
