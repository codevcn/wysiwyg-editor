import { editorContent } from "@/lib/artifact/content/editor.content.js"
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

  static getClosestElementOfNode<TElementType extends HTMLElement = HTMLElement>(
    startNode: HTMLElement,
    selector: (node: HTMLElement) => boolean
  ): TElementType | null {
    let currentElement: HTMLElement | null = startNode
    const editorContentElement = editorContent.getContentElement()
    while (currentElement && editorContentElement.contains(currentElement)) {
      if (selector(currentElement)) {
        return currentElement as TElementType
      }
      currentElement = currentElement.parentElement
    }
    return null
  }

  static getTopBlockElementFromNode(startNode: HTMLElement): HTMLElement | null {
    let currentElement: HTMLElement = startNode
    if (currentElement.tagName === this.topBlockElementTagName) {
      return currentElement
    }
    let topBlockElement: HTMLElement | null = null
    const editorContentElement = editorContent.getContentElement()
    topBlockElement = currentElement.closest<HTMLElement>(this.topBlockElementTagName)
    if (topBlockElement && editorContentElement.contains(topBlockElement)) {
      return topBlockElement
    }
    return null
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
  static insertNewTopBlockElementAfterElement(selection: Selection, element?: HTMLElement): HTMLElement {
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
    // caret đặt ngay trước node con đầu tiên của element
    selectionRange.setStart(element, 0)
    selectionRange.setEnd(element, 0)
    selection.removeAllRanges()
    selection.addRange(selectionRange)
  }

  static moveCaretToEndOfElement(element: HTMLElement, selection: Selection, selectionRange: Range): void {
    // caret đặt ngay sau node con cuối cùng của element
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
        range.setEnd(lastChild, lastChild.textContent?.length || 0)
      } else {
        // nếu ko phải text node thì caret ở cuối content của node element
        range.selectNodeContents(lastChild)
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

  static removeEmptyElements(...elements: HTMLElement[]): void {
    for (const element of elements) {
      if (this.isEmptyElement(element)) {
        element.remove()
      }
    }
  }

  /**
   * Xóa tất cả các element con rỗng trong container.
   * "Rỗng" nghĩa là:
   *  - Không có text node chứa ký tự (kể cả khoảng trắng),
   *  - Và không có element con nào khác còn lại sau khi kiểm tra.
   */
  static removeEmptyChildElements(container: HTMLElement): void {
    const children = Array.from(container.children)
    for (const child of children) {
      if (child instanceof HTMLElement) {
        // Kiểm tra đệ quy các con trước
        this.removeEmptyChildElements(child)
        if (this.isEmptyElement(child)) {
          child.remove()
        }
      }
    }
  }

  /**
   * Kiểm tra element có rỗng không bằng cách duyệt các child node trực tiếp.
   * Trả về true nếu element ko có text node nào hoặc element có ít nhất 1 element con (element con này chưa biết có rỗng hay ko)
   */
  static isEmptyElement(element: HTMLElement): boolean {
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        // Nếu có bất kỳ text node nào (kể cả toàn dấu cách, xuống dòng),
        // thì ta coi element này là KHÔNG rỗng
        if ((node as Text).data.length > 0) {
          return false
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Nếu còn phần tử con thì không rỗng
        return false
      }
    }
    return true
  }

  static checkIfElementContainsText(element: HTMLElement): boolean {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        // Nếu node có độ dài > 0 (bao gồm khoảng trắng), thì coi là có text
        return node.nodeValue && node.nodeValue.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      },
    })
    return !!walker.nextNode()
  }

  static getDeepestChildOfElement(element: HTMLElement): HTMLElement | null {
    let currentElement: HTMLElement = element
    while (currentElement.lastChild && currentElement.lastChild instanceof HTMLElement) {
      currentElement = currentElement.lastChild as HTMLElement
    }
    return currentElement
  }

  static insertElementAfterElement(beforeElement: HTMLElement, afterElement: HTMLElement): void {
    beforeElement.insertAdjacentElement("afterend", afterElement)
  }

  /**
   * Chia element thành 2 phần (before và after), sau đó focus caret vào element sau (element after)
   * @param element html element
   * @param selection selection
   * @returns 2 element mới (before và after)
   */
  static splitElementInHalfAtCaret(element: HTMLElement, selection: Selection): HTMLElement[] {
    const range = selection.getRangeAt(0)

    // Đoạn trước caret
    const beforeRange = range.cloneRange()
    beforeRange.setStartBefore(element)
    const beforeFrag = beforeRange.cloneContents()

    // Đoạn sau caret
    const afterRange = range.cloneRange()
    afterRange.setEndAfter(element)
    const afterFrag = afterRange.cloneContents()

    const beforeElement = beforeFrag.firstChild as HTMLElement
    if (!this.checkIfElementContainsText(beforeElement)) {
      const deepestChild = this.getDeepestChildOfElement(beforeElement)
      if (deepestChild) {
        deepestChild.innerHTML = "<br>"
      } else {
        beforeElement.innerHTML = "<br>"
      }
    }
    const afterElement = afterFrag.firstChild as HTMLElement
    if (!this.checkIfElementContainsText(afterElement)) {
      const deepestChild = this.getDeepestChildOfElement(afterElement)
      if (deepestChild) {
        deepestChild.innerHTML = "<br>"
      } else {
        afterElement.innerHTML = "<br>"
      }
    }

    // Thay thế element cũ bằng 2 element mới
    element.replaceWith(beforeElement, afterElement)

    // Focus caret trong element mới (element after)
    this.moveCaretToStartOfElement(afterElement, selection, document.createRange())

    return [beforeElement, afterElement]
  }

  static isSelectingText(): boolean {
    const selection = window.getSelection()
    return !!selection && !selection.isCollapsed
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
