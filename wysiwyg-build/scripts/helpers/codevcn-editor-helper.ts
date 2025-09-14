import { editorContent } from "@/lib/artifact/content/editor.content.js"
import { ENotifyType } from "@/enums/global-enums"
import { testPerformance } from "@/dev/helpers"

type TIsEmptyTopBlockResult = {
  topBlockElement: HTMLElement | null
  isEmpty: boolean
}

export class CodeVCNEditorHelper {
  static readonly topBlockElementTagName: string = "SECTION"
  private static savedCaretPosition: Range | null = null

  constructor() {}

  static getSavedCaretPosition(): Range | null {
    return this.savedCaretPosition
  }

  /**
   * Kiểm tra xem top block hiện tại có rỗng không, rỗng là khi innerHTML === "" hoặc innerHTML === "<br>"
   */
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

  static createNewEmptyTopBlockElement(): HTMLElement {
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
      newBlockElement = this.createNewEmptyTopBlockElement()
      topBlockElement.insertAdjacentElement("afterend", newBlockElement)
    } else {
      newBlockElement = this.insertNewEmptyTopBlockElement()
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

  static getNextTopBlockElementFromCurrentTopBlock(selection: Selection): HTMLElement | null {
    const currentTopBlockElement = this.getTopBlockElementFromSelection(selection)
    if (currentTopBlockElement) {
      let nextElementSibling = currentTopBlockElement.nextElementSibling
      while (nextElementSibling && nextElementSibling.tagName !== this.topBlockElementTagName) {
        nextElementSibling = nextElementSibling.nextElementSibling
      }
      if (nextElementSibling && nextElementSibling.tagName === this.topBlockElementTagName) {
        return nextElementSibling as HTMLElement
      }
    }
    return null
  }

  static moveCaretToStartOfNextTopBlock(selection: Selection): void {
    const nextTopBlockElement = this.getNextTopBlockElementFromCurrentTopBlock(selection)
    if (nextTopBlockElement) {
      this.moveCaretToStartOfElement(nextTopBlockElement, selection, selection.getRangeAt(0))
    } else {
      this.moveCaretToStartOfElement(this.insertNewEmptyTopBlockElement(), selection, selection.getRangeAt(0))
    }
  }

  static getPreviousTopBlockElementFromCurrentTopBlock(selection: Selection): HTMLElement | null {
    const currentTopBlockElement = this.getTopBlockElementFromSelection(selection)
    if (currentTopBlockElement) {
      let previousElementSibling = currentTopBlockElement.previousElementSibling
      while (previousElementSibling && previousElementSibling.tagName !== this.topBlockElementTagName) {
        previousElementSibling = previousElementSibling.previousElementSibling
      }
      if (previousElementSibling && previousElementSibling.tagName === this.topBlockElementTagName) {
        return previousElementSibling as HTMLElement
      }
    }
    return null
  }

  static moveCaretToPreviousTopBlock(selection: Selection): void {
    const previousTopBlockElement = this.getPreviousTopBlockElementFromCurrentTopBlock(selection)
    if (previousTopBlockElement) {
      this.moveCaretToEndOfElement(previousTopBlockElement, selection, selection.getRangeAt(0))
    } else {
      this.moveCaretToStartOfElement(this.insertNewEmptyTopBlockElement(), selection, selection.getRangeAt(0))
    }
  }

  static findLatestTopBlockElement(): HTMLElement | null {
    return editorContent.getContentElement().lastElementChild as HTMLElement | null
  }

  static insertNewEmptyTopBlockElement(): HTMLElement {
    const newBlockElement = this.createNewEmptyTopBlockElement()
    editorContent.getContentElement().appendChild(newBlockElement)
    return newBlockElement
  }

  static focusCaretAtEndOfEditorContent(): Selection | null {
    const contentElement = editorContent.getContentElement()

    const range = document.createRange()
    const lastElementChild = contentElement.lastElementChild

    if (lastElementChild) {
      // nếu editor content có element con cuối cùng thì caret ở cuối element con đó
      range.selectNodeContents(lastElementChild)
      range.collapse(false)
    } else if (contentElement.innerHTML === "") {
      // nếu rỗng thì collapse trong content element
      const newBlockElement = this.insertNewEmptyTopBlockElement()
      range.selectNodeContents(newBlockElement)
      range.collapse(false)
    }

    const selection = window.getSelection()
    if (!selection) return null

    contentElement.focus()
    selection.removeAllRanges()
    selection.addRange(range)

    return selection
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
   * Chia element thành 2 phần (before và after), sau đó focus caret vào element sau (element after), nếu caretAtMiddle là true thì focus caret vào element giữa (element middle)
   * @param element html element
   * @param selection selection
   * @returns 2 element mới (before và after) hoặc 3 element mới (before, middle và after)
   */
  static splitElementInHalfAtCaret(
    element: HTMLElement,
    selection: Selection,
    caretAtMiddle: boolean = false
  ): HTMLElement[] {
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

    const newElements: HTMLElement[] = [beforeElement, afterElement]
    if (caretAtMiddle) {
      const middleElement = document.createElement(element.tagName)
      middleElement.innerHTML = "<br>"
      newElements[1] = middleElement
      newElements[2] = afterElement
    }

    // Thay thế element cũ bằng 2 element mới
    element.replaceWith(...newElements)

    // Focus caret trong element mới (element after or middle)
    this.moveCaretToStartOfElement(newElements[1], selection, document.createRange())

    return newElements
  }

  static splitCurrentTopBlockElementAtCaret(selection: Selection, caretAtMiddle: boolean = false): HTMLElement[] {
    const currentTopBlockElement = this.getTopBlockElementFromSelection(selection)
    if (currentTopBlockElement) {
      return this.splitElementInHalfAtCaret(currentTopBlockElement, selection, caretAtMiddle)
    }
    return []
  }

  static isSelectingText(): boolean {
    const selection = window.getSelection()
    return !!selection && !selection.isCollapsed
  }

  static removeOverlapChildTags(parent: HTMLElement, descendantTagNames: string[]): void {
    const descendants = Array.from(parent.querySelectorAll<HTMLElement>(descendantTagNames.join(",")))
    for (const descendant of descendants) {
      descendant.replaceWith(...descendant.childNodes)
    }
  }

  static saveCurrentCaretPosition(selection?: Selection): void {
    if (editorContent.checkIsFocusingInEditorContent()) {
      this.savedCaretPosition = selection ? selection.getRangeAt(0) : window.getSelection()?.getRangeAt(0) || null
    }
  }

  static restoreCaretPosition(): Selection | null {
    if (this.savedCaretPosition) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(this.savedCaretPosition)
        return selection
      }
    }
    return null
  }

  static insertElementAtCaret(element: HTMLElement, selection: Selection): void {
    selection.getRangeAt(0).insertNode(element)
  }

  /**
   * Lấy element tại vị trí con trỏ caret hiện tại
   * @param selection Selection object từ window.getSelection()
   * @returns HTMLElement tại vị trí caret hoặc null nếu không tìm thấy
   */
  static getElementAtCaretPosition(selection: Selection): HTMLElement | null {
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer

    if (container.nodeType === Node.TEXT_NODE) {
      // Nếu container là text node, lấy parent element
      return container.parentElement as HTMLElement
    } else if (container.nodeType === Node.ELEMENT_NODE) {
      // Nếu container là element node
      return container as HTMLElement
    }

    return null
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
