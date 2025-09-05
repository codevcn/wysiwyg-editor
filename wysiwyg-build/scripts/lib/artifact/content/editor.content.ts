import { html } from "lit-html"
import { textListingStylish } from "../toolbar/text-listing/text-listing.stylish.js"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper.js"
import { blockquoteStylish } from "../toolbar/text-blocking/blockquote/blockquote.stylish.js"
import { LitHTMLHelper } from "@/helpers/common-helpers.js"
import { addImageModalManager } from "../toolbar/image-blocking/add-image.manager.js"

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

  private makeNewLine(): void {
    const selection = this.checkIsFocusingInEditorContent()
    if (!selection) return
    const { topBlockElement, isEmpty } = CodeVCNEditorHelper.isEmptyTopBlock(selection)
    if (topBlockElement) {
      if (isEmpty) {
        CodeVCNEditorHelper.insertNewTopBlockElementAfterElement(selection, topBlockElement)
      } else {
        CodeVCNEditorHelper.splitTopBlockElementAtCaret(topBlockElement, selection)
      }
    } else {
      this.contentElement.appendChild(CodeVCNEditorHelper.createNewTopBlockElement())
    }
  }

  /**
   * Hàm xử lý sự kiện beforeinput (hàm được gọi khi người dùng nhập chỉnh sửa content trong editor)
   */
  private bindBeforeInputEventListener(): void {
    this.contentElement.addEventListener("beforeinput", (e) => {
      if (e.inputType === "insertParagraph") {
        e.preventDefault()
        this.makeNewLine()
      }
    })
  }

  private bindPasteEventListener(): void {
    this.contentElement.addEventListener("paste", (e) => {
      queueMicrotask(() => {
        addImageModalManager.onPasteImage(e)
      })
    })
  }

  private initEventListeners(): void {
    this.bindKeydownEventListener()
    this.bindBeforeInputEventListener()
    this.bindPasteEventListener()
  }

  getContentElement(): HTMLElement {
    return this.contentElement
  }

  checkIsFocusingInEditorContent(): Selection | null {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null
    const { anchorNode, focusNode } = selection
    if (!anchorNode) return null
    if (!this.contentElement.contains(anchorNode) || !this.contentElement.contains(focusNode)) return null
    if (this.contentElement.isSameNode(anchorNode) || this.contentElement.isSameNode(focusNode)) return null
    return selection
  }
}

export const editorContent = new EditorContent()
