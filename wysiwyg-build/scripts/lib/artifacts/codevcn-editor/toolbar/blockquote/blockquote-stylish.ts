import { EBlockquoteType, EErrorMessage } from "@/enums/global-enums.js"
import { CodeVCNEditorHelper } from "../../helpers/codevcn-editor-helper.js"
import { EditorErrorHelper } from "../../helpers/error-helper.js"
import { editorContent } from "../../content/editor-content.js"

class BlockquoteStylish {
  private blockQuoteTagName: string = "BLOCKQUOTE"
  private quoteLineTagName: string = "P"
  private currentBlockquoteElement: HTMLElement | null = null

  constructor() {}

  private createBlockQuoteElement(blockQuoteInnerHTML: HTMLElement["innerHTML"]): HTMLElement {
    const blockQuoteElement = document.createElement(this.blockQuoteTagName)
    blockQuoteElement.innerHTML = blockQuoteInnerHTML
    return blockQuoteElement
  }

  private insertNewBlockquoteElement(topBlockElement: HTMLElement): void {
    const blockQuoteElement = this.createBlockQuoteElement(`<${this.quoteLineTagName}><br></${this.quoteLineTagName}>`)
    topBlockElement.replaceChildren(blockQuoteElement)
    this.currentBlockquoteElement = blockQuoteElement
  }

  private exitBlockquote(): void {
    const latestTopBlockElement = CodeVCNEditorHelper.findLatestTopBlockElement()
    if (latestTopBlockElement) {
      CodeVCNEditorHelper.insertNewTopBlockElementAfterElement(latestTopBlockElement)
    }
    this.currentBlockquoteElement = null
  }

  private checkIfIsInBlockquote(selection: Selection): HTMLElement | null {
    const anchorNode = selection.anchorNode
    if (!anchorNode) return null
    let node: HTMLElement | null = null
    if (anchorNode.nodeType === Node.TEXT_NODE) {
      node = anchorNode.parentNode as HTMLElement | null
    } else {
      node = anchorNode as HTMLElement
    }
    if (node?.tagName === this.blockQuoteTagName) {
      return node
    }
    const editorContentElement = editorContent.getContentElement()
    while (node && node.tagName !== this.blockQuoteTagName && editorContentElement.contains(node)) {
      node = node.closest(this.blockQuoteTagName) as HTMLElement
    }
    if (node?.tagName !== this.blockQuoteTagName) return null
    return node
  }

  private makeBlockquoteOnButtonClick(): void {
    const selection = window.getSelection()
    if (!selection) return
    // bắt buộc phải check bằng selection hiện tại khi tạo blockquote bằng click on button, vì
    // khi tạo blockquote mới thì chưa biết caret có nằm trong blockquote hay không
    if (this.checkIfIsInBlockquote(selection)) {
      this.exitBlockquote()
      return
    }
    const { topBlockElement, isEmpty } = CodeVCNEditorHelper.isEmptyTopBlock(selection)
    if (topBlockElement) {
      if (isEmpty) {
        // nếu đang ở trong 1 block trống thì tạo blockquote cho block đó
        this.insertNewBlockquoteElement(topBlockElement)
      } else {
        // nếu đang ở trong 1 block KHÔNG trống thì tạo blockquote cho block mới
        const newBlockElement = CodeVCNEditorHelper.insertNewTopBlockElementAfterElement(topBlockElement)
        if (newBlockElement) {
          this.insertNewBlockquoteElement(newBlockElement)
        }
      }
    }
  }

  private getClosestQuoteLineElement(selection: Selection): HTMLElement | null {
    let node: HTMLElement
    const anchorNode = selection.anchorNode!
    if (anchorNode.nodeType === Node.TEXT_NODE) {
      node = anchorNode.parentNode as HTMLElement
    } else {
      node = anchorNode as HTMLElement
    }
    if (node.tagName === this.quoteLineTagName) {
      return node as HTMLElement
    }
    let quoteLineElement: HTMLElement | null = null
    while (node && node.tagName !== this.quoteLineTagName && this.currentBlockquoteElement?.contains(node)) {
      node = node.parentNode as HTMLElement
      quoteLineElement = node
    }
    if (quoteLineElement?.tagName !== this.quoteLineTagName) return null
    return quoteLineElement
  }

  private isOnEmptyLine(selection: Selection): boolean {
    const quoteLineElement = this.getClosestQuoteLineElement(selection)
    if (!quoteLineElement) {
      throw EditorErrorHelper.createError(EErrorMessage.QUOTE_LINE_ELEMENT_NOT_FOUND)
    }
    const trimmedInnerHTML = quoteLineElement.innerHTML.trim()
    return trimmedInnerHTML === "<br>" || trimmedInnerHTML === ""
  }

  private insertNewEmptyLine(selection: Selection): void {
    if (!this.currentBlockquoteElement) return
    const newLineElement = document.createElement(this.quoteLineTagName)
    newLineElement.innerHTML = "<br>"
    this.currentBlockquoteElement.appendChild(newLineElement)
    CodeVCNEditorHelper.moveCaretToStartOfElement(newLineElement, selection, selection.getRangeAt(0))
  }

  private makeBlockquoteOnKeyboardEvent(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      e.preventDefault()
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return
      const isInBlockquote = this.checkIfIsInBlockquote(selection)
      if (!isInBlockquote) return
      // chỉ dc thực thi nếu caret nằm trong blockquote
      if (this.isOnEmptyLine(selection)) {
        console.log(">>> run this 120")
        this.exitBlockquote()
      } else {
        console.log(">>> run this 123")
        this.insertNewEmptyLine(selection)
      }
    }
  }

  onAction(action?: EBlockquoteType, e?: KeyboardEvent) {
    if (action) {
      switch (action) {
        case EBlockquoteType.BLOCKQUOTE:
          this.makeBlockquoteOnButtonClick()
          break
      }
    } else if (e) {
      this.makeBlockquoteOnKeyboardEvent(e)
    }
  }
}

export const blockquoteStylish = new BlockquoteStylish()
