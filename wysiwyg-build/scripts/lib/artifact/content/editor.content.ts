import { html } from "lit-html"
import { textListingStylish } from "../toolbar/text-listing/text-listing.stylish.js"
import { CodeVCNEditorEngine } from "@/lib/artifact/engine/codevcn-editor.engine.js"
import { blockquoteStylish } from "../toolbar/text-blocking/blockquote/blockquote.stylish.js"
import { LitHTMLHelper } from "@/helpers/common-helpers.js"
import { addImageModalManager } from "../toolbar/image-blocking/add-image.manager.js"
import { textLinkingManager } from "../toolbar/text-linking/text-linking.manager.js"
import { codeBlockingStylish } from "../toolbar/code-blocking/code-blocking.stylish.js"
import { TagWrappingPreparationEngine } from "../engine/preparation.engine.js"
import { tablePlacingManager } from "../toolbar/table-placing/table-placing.manager.js"

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
        CodeVCNEditorEngine.saveCurrentCaretPosition()
        queueMicrotask(() => {
          const selection = CodeVCNEditorEngine.checkIsFocusingInEditorContent()
          if (selection) {
            textLinkingManager.showModalOnCaretMoves(selection)
            tablePlacingManager.onEditorContentSelectionChange(selection)
          }
        })
      }
    })
  }

  /**
   * Hàm xử lý sự kiện beforeinput (hàm được gọi khi người dùng nhập chỉnh sửa content trong editor)
   */
  private bindBeforeInputEventListener(): void {
    this.contentElement.addEventListener("beforeinput", (e) => {
      const inputType = e.inputType
      if (inputType === "insertParagraph") {
        if (this.isEventAllowed(e)) {
          e.preventDefault()
          this.makeNewLine()
        }
      }
      if (inputType === "insertText" || inputType === "insertCompositionText") {
        if (this.isEventAllowed(e)) {
          TagWrappingPreparationEngine.completeStylingForWrapping(e)
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
          class="${this.contentElementName} py-4 px-8 min-h-[300px] outline-none"
          contenteditable="true"
          spellcheck="false"
        ></div>
      `
    return LitHTMLHelper.createElementFromRenderer(Renderer, [])
  }

  private makeNewLine(): void {
    const selection = CodeVCNEditorEngine.checkIsFocusingInEditorContent()
    if (!selection) return
    const topBlockElement = CodeVCNEditorEngine.getTopBlockElementFromSelection(selection)
    if (topBlockElement) {
      CodeVCNEditorEngine.splitElementInHalfAtCaret(topBlockElement, selection)
    } else {
      this.contentElement.appendChild(CodeVCNEditorEngine.createNewEmptyTopBlockElement())
    }
  }

  getContentElement(): HTMLElement {
    return this.contentElement
  }
}

export const editorContent = new EditorContent()
