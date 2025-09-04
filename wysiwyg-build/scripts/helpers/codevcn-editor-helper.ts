import { render, TemplateResult } from "lit-html"
import { editorContent } from "@/lib/artifact/content/editor.content.js"
import DOMPurify from "dompurify"

type TIsEmptyTopBlockResult = {
  topBlockElement: HTMLElement | null
  isEmpty: boolean
}

export class CodeVCNEditorHelper {
  static readonly topBlockElementTagName: string = "SECTION"

  constructor() {}

  static isEmptyTopBlock(selection: Selection): TIsEmptyTopBlockResult {
    const topBlockElement = this.getTopBlockElementFromSelection(selection)
    if (topBlockElement) {
      const trimmedInnerHTML = topBlockElement.innerHTML.trim()
      if (trimmedInnerHTML === "" || trimmedInnerHTML === "<br>") {
        return {
          topBlockElement,
          isEmpty: true,
        }
      }
      return {
        topBlockElement,
        isEmpty: false,
      }
    }
    return {
      topBlockElement: null,
      isEmpty: false,
    }
  }

  static createNewTopBlockElement(): HTMLElement {
    const newBlock = document.createElement("section")
    newBlock.innerHTML = "<br>"
    return newBlock
  }

  static getClosestElementOfNode(startNode: HTMLElement, selector: (node: HTMLElement) => boolean): HTMLElement | null {
    let currentElement: HTMLElement = startNode
    const editorContentElement = editorContent.getContentElement()
    while (currentElement && editorContentElement.contains(currentElement)) {
      if (selector(currentElement)) {
        return currentElement
      }
      currentElement = currentElement.parentNode as HTMLElement
    }
    return null
  }

  static getTopBlockElementFromNode(startNode: HTMLElement): HTMLElement | null {
    let currentElement: HTMLElement = startNode
    let topBlockElement: HTMLElement | null = null
    const editorContentElement = editorContent.getContentElement()
    const editorContentElementName = editorContent.getContentElementName()
    while (currentElement && editorContentElement.contains(currentElement)) {
      currentElement = currentElement.closest(this.topBlockElementTagName) as HTMLElement
      if (currentElement.parentElement?.classList.contains(editorContentElementName)) {
        topBlockElement = currentElement
        break
      }
    }
    if (topBlockElement?.tagName !== this.topBlockElementTagName) {
      return null
    }
    return topBlockElement
  }

  static getTopBlockElementFromSelection(selection: Selection): HTMLElement | null {
    const anchorNode = selection.anchorNode
    if (!anchorNode) return null
    return this.getTopBlockElementFromNode(
      anchorNode.nodeType === Node.TEXT_NODE ? (anchorNode.parentNode as HTMLElement) : (anchorNode as HTMLElement)
    )
  }

  /**
   * Tạo 1 block mới và đặt caret vào block mới
   * @returns Block mới đã được chèn
   */
  static insertNewTopBlockElementAfterElement(element: HTMLElement): HTMLElement | null {
    const selection = window.getSelection()
    if (!selection) return null

    const newBlockElement = this.createNewTopBlockElement()

    // Insert vào sau 1 element
    element.insertAdjacentElement("afterend", newBlockElement)

    // Đặt caret vào block mới
    this.moveCaretToStartOfElement(newBlockElement, selection, selection.getRangeAt(0))

    return newBlockElement
  }

  static moveCaretToStartOfElement(element: HTMLElement, selection: Selection, selectionRange: Range): void {
    selectionRange.setStart(element, 0)
    selectionRange.setEnd(element, 0)
    selection.removeAllRanges()
    selection.addRange(selectionRange)
  }

  static findLatestTopBlockElement(): HTMLElement | null {
    return editorContent.getContentElement().lastElementChild as HTMLElement | null
  }

  static insertNewTopBlockElement(): void {
    editorContent.getContentElement().appendChild(this.createNewTopBlockElement())
  }
}
