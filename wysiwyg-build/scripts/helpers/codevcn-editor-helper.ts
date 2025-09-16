import { editorContent } from "@/lib/artifact/content/editor.content.js"
import { ENotifyType } from "@/enums/global-enums"
import type {
  TCheckIfRangeIsInsideWrapper,
  TCleanUpElementsHandler,
  THandleEachRangeHandler,
  TWrapperSelector,
  TWrappingType,
} from "@/types/global-types"

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

  static checkIsFocusingInEditorContent(): Selection | null {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null
    const { anchorNode, focusNode } = selection
    if (!anchorNode || !focusNode) return null
    const contentElement = editorContent.getContentElement()
    if (!contentElement.contains(anchorNode) || !contentElement.contains(focusNode)) return null
    if (contentElement.isSameNode(anchorNode) || contentElement.isSameNode(focusNode)) return null
    return selection
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

  static getClosestParentOfElement<TElementType extends HTMLElement = HTMLElement>(
    startNode: HTMLElement,
    selector: TWrapperSelector
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

  static getTopBlockElementFromElement(startElement: HTMLElement): HTMLElement | null {
    let currentElement: HTMLElement = startElement
    if (currentElement.tagName === this.topBlockElementTagName) {
      return currentElement
    }
    let topBlockElement: HTMLElement | null = null
    topBlockElement = currentElement.closest<HTMLElement>(this.topBlockElementTagName)
    if (topBlockElement && editorContent.getContentElement().contains(topBlockElement)) {
      return topBlockElement
    }
    return null
  }

  static getTopBlockElementFromSelection(selection: Selection): HTMLElement | null {
    const anchorNode = selection.anchorNode
    if (!anchorNode) return null
    return this.getTopBlockElementFromElement(
      anchorNode.nodeType === Node.TEXT_NODE ? (anchorNode.parentElement as HTMLElement) : (anchorNode as HTMLElement)
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
      const topBlockElement = this.getTopBlockElementFromElement(element)!
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

  static getNextTopBlockElementFromCurrentTopBlock(currentTopBlockElement: HTMLElement): HTMLElement | null {
    let nextElementSibling = currentTopBlockElement.nextElementSibling
    while (nextElementSibling && nextElementSibling.tagName !== this.topBlockElementTagName) {
      nextElementSibling = nextElementSibling.nextElementSibling
    }
    return (nextElementSibling || null) as HTMLElement | null
  }

  static getNextTopBlockElementFromCurrentCaret(selection: Selection): HTMLElement | null {
    const currentTopBlockElement = this.getTopBlockElementFromSelection(selection)
    if (currentTopBlockElement) {
      return this.getNextTopBlockElementFromCurrentTopBlock(currentTopBlockElement)
    }
    return null
  }

  static moveCaretToStartOfNextTopBlock(selection: Selection): void {
    const nextTopBlockElement = this.getNextTopBlockElementFromCurrentCaret(selection)
    if (nextTopBlockElement) {
      this.moveCaretToStartOfElement(nextTopBlockElement, selection, selection.getRangeAt(0))
    } else {
      this.moveCaretToStartOfElement(this.insertNewEmptyTopBlockElement(), selection, selection.getRangeAt(0))
    }
  }

  static getPreviousTopBlockElementFromCurrentTopBlock(currentTopBlockElement: HTMLElement): HTMLElement | null {
    let previousElementSibling = currentTopBlockElement.previousElementSibling
    while (previousElementSibling && previousElementSibling.tagName !== this.topBlockElementTagName) {
      previousElementSibling = previousElementSibling.previousElementSibling
    }
    return (previousElementSibling || null) as HTMLElement | null
  }

  static getPreviousTopBlockElementFromCurrentCaret(selection: Selection): HTMLElement | null {
    const currentTopBlockElement = this.getTopBlockElementFromSelection(selection)
    if (currentTopBlockElement) {
      return this.getPreviousTopBlockElementFromCurrentTopBlock(currentTopBlockElement)
    }
    return null
  }

  static moveCaretToPreviousTopBlock(selection: Selection): void {
    const previousTopBlockElement = this.getPreviousTopBlockElementFromCurrentCaret(selection)
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
    const beforeFrag = beforeRange.extractContents()

    // Đoạn sau caret
    const afterRange = range.cloneRange()
    afterRange.setEndAfter(element)
    const afterFrag = afterRange.extractContents()

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

  static isSelectingContent(): Selection | null {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return null
    return selection
  }

  static saveCurrentCaretPosition(selection?: Selection): void {
    if (CodeVCNEditorHelper.checkIsFocusingInEditorContent()) {
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

  static getTopBlockFromSelectionRange(selectionRange: Range): HTMLElement | null {
    let startContainer = selectionRange.startContainer
    if (!(startContainer instanceof HTMLElement)) {
      startContainer = startContainer.parentElement!
    }
    return this.getTopBlockElementFromElement(startContainer as HTMLElement)
  }

  /**
   * Lấy ra tất cả các top block được bôi đen (selected) trong editor.
   * @returns HTMLElement[] | null - Mảng các top block được bôi đen, hoặc null nếu không bôi đen
   */
  static getSelectedTopBlocksFromRange(selectionRange: Range): HTMLElement[] | null {
    if (selectionRange.collapsed) return null

    let currentTopBlockElement = this.getTopBlockFromSelectionRange(selectionRange)
    if (!currentTopBlockElement) return null

    const topBlocks: HTMLElement[] = []
    while (
      currentTopBlockElement &&
      currentTopBlockElement.tagName === this.topBlockElementTagName &&
      selectionRange.intersectsNode(currentTopBlockElement)
    ) {
      topBlocks.push(currentTopBlockElement)
      currentTopBlockElement = this.getNextTopBlockElementFromCurrentTopBlock(currentTopBlockElement)
    }

    return topBlocks.length > 0 ? topBlocks : null
  }

  static wrapElementContentsByEmptyElement(element: HTMLElement, emptyElement: HTMLElement): void {
    emptyElement.append(...element.childNodes)
    element.replaceChildren(emptyElement)
  }

  static getFirstTextNodeFromNode(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue?.trim() ? node : null
    let child = node.firstChild
    while (child) {
      const found = this.getFirstTextNodeFromNode(child)
      if (found) return found
      child = child.nextSibling
    }
    return null
  }

  static getLastTextNodeFromNode(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue?.trim() ? node : null
    let child = node.lastChild
    while (child) {
      const found = this.getLastTextNodeFromNode(child)
      if (found) return found
      child = child.previousSibling
    }
    return null
  }

  static removeEmptyChildrenRecursively(parent: HTMLElement): void {
    if (!parent || !(parent instanceof HTMLElement)) return

    // Duyệt tất cả con từ dưới lên để tránh mất tham chiếu khi xóa
    const children = Array.from(parent.children) as HTMLElement[]
    for (const child of children) {
      this.removeEmptyChildrenRecursively(child)

      // Nếu element con hoàn toàn không có text (sau khi duyệt cả con cháu)
      if (child.textContent?.length === 0) {
        child.remove()
      }
    }
  }

  static removeOverlapChildTags(parent: HTMLElement, tagNamesToRemove: string[], removeParentTag?: boolean): void {
    const descendants = parent.querySelectorAll<HTMLElement>(tagNamesToRemove.join(","))
    for (const descendant of descendants) {
      descendant.replaceWith(...descendant.childNodes)
    }
    if (removeParentTag && tagNamesToRemove.includes(parent.tagName)) {
      parent.replaceWith(...parent.childNodes)
    }
  }

  /**
   * Gộp 2 tag giống nhau liền kề thành 1 tag, VD: <b>Hello</b><b> World</b> => <b>Hello World</b>
   */
  static mergeAdjacentStyling(parent: HTMLElement): void {
    let node = parent.firstChild
    while (node) {
      const next = node.nextSibling
      if (node instanceof HTMLElement && next instanceof HTMLElement && node.tagName === next.tagName) {
        // chuyển toàn bộ con của next sang node rồi xóa next
        while (next.firstChild) node.appendChild(next.firstChild)
        parent.removeChild(next)
        continue // kiểm tra lại node hiện tại với phần tử kế tiếp mới
      }
      node = next
    }
  }

  /**
   * Hàm xử lý xóa styling tag khỏi selection.
   */
  static unwrapRangeContentByTag(
    selectionRange: Range,
    parentElement: HTMLElement,
    contentWrapper?: HTMLElement
  ): void {
    // Tìm thẻ styling tag NHỎ NHẤT bao trọn selection
    const doc = parentElement.ownerDocument
    const tagName = parentElement.tagName // styling tag name

    // Clone nội dung của 3 đoạn: trái | selection | phải (không đụng DOM gốc)
    const clonedRange = selectionRange.cloneRange()

    const leftRange = doc.createRange()
    leftRange.setStart(parentElement, 0)
    leftRange.setEnd(clonedRange.startContainer, clonedRange.startOffset)

    const rightRange = doc.createRange()
    rightRange.setStart(clonedRange.endContainer, clonedRange.endOffset)
    rightRange.setEnd(parentElement, parentElement.childNodes.length)

    const leftFragment = leftRange.cloneContents()
    const midFragment = clonedRange.cloneContents() // phần cần bỏ styling tag
    const rightFragment = rightRange.cloneContents()

    // Xây fragment thay thế, fragment này chứa: <styling tag>left</styling tag> + mid + <styling tag>right</styling tag>
    const replacement = doc.createDocumentFragment()

    if (leftFragment.hasChildNodes()) {
      const leftElement = doc.createElement(tagName)
      leftElement.appendChild(leftFragment)
      replacement.appendChild(leftElement)
    }

    if (midFragment.hasChildNodes()) {
      // KHÔNG bị bọc bởi styling tag
      if (contentWrapper) {
        contentWrapper.appendChild(midFragment)
        replacement.appendChild(contentWrapper)
      } else {
        replacement.appendChild(midFragment)
      }
    }

    if (rightFragment.hasChildNodes()) {
      const rightElement = doc.createElement(tagName)
      rightElement.appendChild(rightFragment)
      replacement.appendChild(rightElement)
    }

    // Thay thẻ cha <styling tag> cũ bằng cấu trúc mới
    parentElement.replaceWith(replacement)
  }

  static wrapRangeContentByTag(range: Range, wrapper: HTMLElement): HTMLElement {
    const content = range.extractContents()
    const clonedWrapper = wrapper.cloneNode() as HTMLElement
    clonedWrapper.appendChild(content)
    range.insertNode(clonedWrapper)
    return clonedWrapper
  }

  static checkIfRangeIsInsideWrapper(selectionRange: Range, wrapperSelector: TWrapperSelector): HTMLElement | null {
    let anchorNode = selectionRange.startContainer
    if (!(anchorNode instanceof HTMLElement)) {
      anchorNode = anchorNode.parentElement!
    }
    return this.getClosestParentOfElement(anchorNode as HTMLElement, wrapperSelector)
  }

  static wrapUnwrapRangeByWrapper(
    selectionRange: Range,
    wrapper: HTMLElement,
    wrappingType: TWrappingType,
    checkIfRangeIsInsideWrapper: TCheckIfRangeIsInsideWrapper,
    cleanUpElements: TCleanUpElementsHandler
  ): void {
    if (wrappingType === "unwrap") {
      const parentElement = checkIfRangeIsInsideWrapper(selectionRange)
      if (parentElement) {
        const container = parentElement.parentElement
        if (container && container instanceof HTMLElement) {
          this.unwrapRangeContentByTag(selectionRange, parentElement)
          cleanUpElements(container, wrappingType)
        }
      } else {
        let container = selectionRange.startContainer
        if (!(container instanceof HTMLElement)) {
          container = container.parentElement!
        }
        cleanUpElements(container as HTMLElement, wrappingType, true)
      }
    } else {
      if (checkIfRangeIsInsideWrapper(selectionRange)) return
      const parentElement = this.wrapRangeContentByTag(selectionRange, wrapper)
      cleanUpElements(parentElement, wrappingType)
    }
  }

  static handleWrappingSelectionInMultipleLines(
    selection: Selection,
    tagNamesForWrapping: string[],
    handleEachRange: THandleEachRangeHandler
  ): HTMLElement[] | null {
    if (selection.rangeCount === 0) return null
    const topBlocks = this.getSelectedTopBlocksFromRange(selection.getRangeAt(0))
    if (!topBlocks) return null
    if (topBlocks.length > 1) {
      const rootRange = selection.getRangeAt(0)

      const firstTopBlock = topBlocks[0]
      const clonedFirstRange = rootRange.cloneRange()
      const lastTextNode = this.getLastTextNodeFromNode(firstTopBlock)
      let wrappingType: TWrappingType = "wrap"
      if (lastTextNode) {
        const startContainer = rootRange.startContainer
        const closestWrapper = this.checkIfRangeIsInsideWrapper(
          clonedFirstRange,
          (element) => tagNamesForWrapping.includes(element.tagName) && element.contains(startContainer)
        )
        if (closestWrapper) {
          wrappingType = "unwrap"
        }
        clonedFirstRange.setEnd(lastTextNode, lastTextNode.nodeValue?.length || 0)
        handleEachRange(clonedFirstRange, wrappingType)
      }

      const lastTopBlock = topBlocks[topBlocks.length - 1]
      const clonedLastRange = rootRange.cloneRange()
      const firstTextNode = this.getFirstTextNodeFromNode(lastTopBlock)
      if (firstTextNode) {
        clonedLastRange.setStart(firstTextNode, 0)
        handleEachRange(clonedLastRange, wrappingType)
      }

      const otherTopBlocks = topBlocks.length > 2 ? topBlocks.slice(1, topBlocks.length - 1) : []
      for (const topBlock of otherTopBlocks) {
        const range = document.createRange()
        const firstTextNode = this.getFirstTextNodeFromNode(topBlock)
        const lastTextNode = this.getLastTextNodeFromNode(topBlock)
        if (firstTextNode && lastTextNode) {
          range.setStart(firstTextNode, 0)
          range.setEnd(lastTextNode, lastTextNode.nodeValue?.length || 0)
          handleEachRange(range, wrappingType)
        }
      }

      return topBlocks
    } else if (topBlocks.length === 1) {
      const rootRange = selection.getRangeAt(0)
      const closestWrapper = this.checkIfRangeIsInsideWrapper(rootRange, (element) =>
        tagNamesForWrapping.includes(element.tagName)
      )
      handleEachRange(rootRange, closestWrapper ? "unwrap" : "wrap")
      return topBlocks
    }
    return null
  }
}
