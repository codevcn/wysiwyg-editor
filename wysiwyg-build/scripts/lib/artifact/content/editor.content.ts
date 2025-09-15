import { html } from "lit-html"
import { textListingStylish } from "../toolbar/text-listing/text-listing.stylish.js"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper.js"
import { blockquoteStylish } from "../toolbar/text-blocking/blockquote/blockquote.stylish.js"
import { LitHTMLHelper } from "@/helpers/common-helpers.js"
import { addImageModalManager } from "../toolbar/image-blocking/add-image.manager.js"
import { textLinkingManager } from "../toolbar/text-linking/text-linking.manager.js"
import { codeBlockingStylish } from "../toolbar/code-blocking/code-blocking.stylish.js"

class EditorContent {
  private contentElement: HTMLElement
  private contentElementName: string = "NAME-editor-content"

  constructor() {
    this.contentElement = this.createContentElement()
    this.setupContentArea()
  }

  private setupContentArea(): void {
    this.bindContentEventListener()
    this.bindSelectionChangeEventListener()
    this.bindKeydownEventListener()
    this.bindBeforeInputEventListener()
    this.bindPasteEventListener()
    this.bindMouseMoveEventListener()
  }

  private bindMouseMoveEventListener(): void {
    let timer: NodeJS.Timeout
    const debounceTime: number = 100
    this.contentElement.addEventListener("mousemove", (e) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        textLinkingManager.showTextLinkModalOnContentMouseMove(e)
      }, debounceTime)
    })
  }

  private bindKeydownEventListener(): void {
    this.contentElement.addEventListener("keydown", (e) => {
      if (this.isEventAllowed(e)) {
        queueMicrotask(() => {
          textListingStylish.onAction(undefined, e)
          blockquoteStylish.onAction(undefined, e)
        })
      }
    })
  }

  private bindContentEventListener(): void {
    this.contentElement.addEventListener("click", (e) => {
      if (this.isEventAllowed(e)) {
        textLinkingManager.activateLinksOnEditorContentClick(e)
      }
    })
  }

  private bindSelectionChangeEventListener(): void {
    document.addEventListener("selectionchange", (e) => {
      if (this.isEventAllowed(e)) {
        CodeVCNEditorHelper.saveCurrentCaretPosition()
        queueMicrotask(() => {
          textLinkingManager.showModalOnCaretMoves()
        })
      }
    })
  }

  /**
   * Hàm xử lý sự kiện beforeinput (hàm được gọi khi người dùng nhập chỉnh sửa content trong editor)
   */
  private bindBeforeInputEventListener(): void {
    this.contentElement.addEventListener("beforeinput", (e) => {
      if (this.isEventAllowed(e)) {
        if (e.inputType === "insertParagraph") {
          e.preventDefault()
          this.makeNewLine()
        }
      }
    })
  }

  private bindPasteEventListener(): void {
    this.contentElement.addEventListener("paste", (e) => {
      if (this.isEventAllowed(e)) {
        queueMicrotask(() => {
          addImageModalManager.onPasteImage(e)
        })
      }
    })
  }

  private isEventAllowed(e: Event): boolean {
    const target = e.target
    if (target instanceof HTMLElement && target.closest(`.${codeBlockingStylish.getCodeBlockBoxClassName()}`)) {
      return false
    }
    return true
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
    return LitHTMLHelper.createElementFromRenderer(Renderer, [])
  }

  private makeNewLine(): void {
    const selection = CodeVCNEditorHelper.checkIsFocusingInEditorContent()
    if (!selection) return
    const topBlockElement = CodeVCNEditorHelper.getTopBlockElementFromSelection(selection)
    if (topBlockElement) {
      CodeVCNEditorHelper.splitElementInHalfAtCaret(topBlockElement, selection)
    } else {
      this.contentElement.appendChild(CodeVCNEditorHelper.createNewEmptyTopBlockElement())
    }
  }

  getContentElement(): HTMLElement {
    return this.contentElement
  }
}

export const editorContent = new EditorContent()
