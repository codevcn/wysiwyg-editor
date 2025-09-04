import { render, TemplateResult } from "lit-html"
import { editorContent } from "@/lib/artifact/content/editor.content.js"
import DOMPurify from "dompurify"
import { ENotifyType } from "@/enums/global-enums"

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
    let currentElement: HTMLElement | null = startNode
    let topBlockElement: HTMLElement | null = null
    const editorContentElement = editorContent.getContentElement()
    const editorContentElementName = editorContent.getContentElementName()
    while (currentElement && editorContentElement.contains(currentElement)) {
      currentElement = currentElement.closest<HTMLElement>(this.topBlockElementTagName)
      if (currentElement && currentElement.parentElement?.classList.contains(editorContentElementName)) {
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
  static insertNewTopBlockElementAfterElement(element?: HTMLElement): HTMLElement | null {
    const selection = editorContent.checkIsFocusingInEditorContent()
    if (!selection) return null

    let newBlockElement: HTMLElement

    if (element) {
      // Insert vào sau 1 element
      const topBlockElement = this.getTopBlockElementFromNode(element)!
      newBlockElement = this.createNewTopBlockElement()
      topBlockElement.insertAdjacentElement("afterend", newBlockElement)
    } else {
      newBlockElement = this.insertNewTopBlockElement()
    }

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

  static moveCaretToEndOfElement(element: HTMLElement, selection: Selection, selectionRange: Range): void {
    selectionRange.selectNodeContents(element)
    selectionRange.collapse(false)
    selection.removeAllRanges()
    selection.addRange(selectionRange)
  }

  static findLatestTopBlockElement(): HTMLElement | null {
    return editorContent.getContentElement().lastElementChild as HTMLElement | null
  }

  static insertNewTopBlockElement(): HTMLElement {
    const newBlockElement = this.createNewTopBlockElement()
    editorContent.getContentElement().appendChild(newBlockElement)
    return newBlockElement
  }

  static focusCaretAtEndOfEditorContent(): void {
    const contentElement = editorContent.getContentElement()

    const range = document.createRange()
    const lastChild = contentElement.lastChild

    if (lastChild) {
      if (lastChild.nodeType === Node.TEXT_NODE) {
        // caret ở cuối text node
        range.setStart(lastChild, lastChild.textContent?.length || 0)
      } else {
        // caret ở cuối nội dung node element
        range.selectNodeContents(lastChild)
        range.collapse(false)
      }
    } else {
      // nếu rỗng thì collapse trong content element
      range.selectNodeContents(contentElement)
      range.collapse(false)
    }

    const selection = window.getSelection()
    if (!selection) return
    contentElement.focus()
    selection.removeAllRanges()
    selection.addRange(range)
  }

  static notify(type: ENotifyType, message: string) {
    const notificationElement = document.createElement("div")
    notificationElement.className =
      "fixed top-0 left-0 w-[250px] h-[100px] bg-white border border-gray-400 rounded-md flex items-center p-4 text-black"
    if (type === ENotifyType.SUCCESS) {
      notificationElement.classList.add("bg-green-300")
    } else if (type === ENotifyType.ERROR) {
      notificationElement.classList.add("bg-red-300")
    } else if (type === ENotifyType.WARNING) {
      notificationElement.classList.add("bg-yellow-300")
    } else if (type === ENotifyType.INFO) {
      notificationElement.classList.add("bg-blue-300")
    }
    notificationElement.innerHTML = message
    document.body.appendChild(notificationElement)
    setTimeout(() => {
      notificationElement.remove()
    }, 2000)
  }
}
