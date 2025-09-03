import { ETextStylingType } from "@/enums/global-enums"
import { DOMHelpers } from "../../helpers/DOMHelpers"
import { editorContent } from "../../content/editor-content"

class TextStylingStylish {
  private currentStylingType: ETextStylingType | null = null
  private parentStylingElement: HTMLElement | null = null
  /**
   * Tên các thẻ styling cho từng loại styling (index theo thứ tự ưu tiên, 0 là ưu tiên nhất rồi đến 1, 2, 3, ...)
   */
  private tagNamesForStyling: Record<ETextStylingType, string[]> = {
    [ETextStylingType.BOLD]: ["B", "STRONG"],
    [ETextStylingType.ITALIC]: ["I", "EM"],
    [ETextStylingType.UNDERLINE]: ["U", "INS"],
    [ETextStylingType.STRIKE_THROUGH]: ["S", "DEL", "STRIKE"],
  }

  constructor() {}

  private getAllAvailableTagNames(): string[] {
    return Object.values(this.tagNamesForStyling).flat()
  }

  private ifTagNameIsCurrentStyling(tagName: string): boolean {
    return this.getCurrentStylingTagNames().includes(tagName)
  }

  private setCurrentStylingType(stylingType: ETextStylingType): void {
    this.currentStylingType = stylingType
  }

  private getCurrentStylingTagNames(): string[] {
    return this.tagNamesForStyling[this.currentStylingType!]
  }

  private getCurrentStylingTagName(): string {
    return this.getCurrentStylingTagNames()[0]
  }

  /**
   * Lấy thẻ <styling tag> gần nhất chứa đầy đủ vùng bôi đen.
   */
  private setParentStylingElement(selectionRange: Range): void {
    let node =
      selectionRange.startContainer.nodeType === Node.TEXT_NODE
        ? (selectionRange.startContainer.parentNode as HTMLElement)
        : (selectionRange.startContainer as HTMLElement)
    if (!node) return
    this.parentStylingElement = DOMHelpers.getClosestElementOfNode(
      node,
      (node) => this.ifTagNameIsCurrentStyling(node.tagName) && node.contains(selectionRange.endContainer)
    )
  }

  /**
   * Gộp 2 tag giống nhau liền kề thành 1 tag, VD: <b>Hello</b><b> World</b> => <b>Hello World</b>
   */
  private mergeAdjacentStyling(parent: HTMLElement): void {
    let node = parent.firstChild as HTMLElement | null
    while (node) {
      const next = node.nextSibling as HTMLElement | null
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        next &&
        next.nodeType === Node.ELEMENT_NODE &&
        this.ifTagNameIsCurrentStyling(node.tagName) &&
        node.tagName === next.tagName
      ) {
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
  private unstylingFromSelection(selectionRange: Range): void {
    // Tìm thẻ styling tag NHỎ NHẤT bao trọn selection
    const parentStylingElement = this.parentStylingElement
    if (!parentStylingElement) return // selection không nằm trọn trong 1 styling tag

    const doc = parentStylingElement.ownerDocument
    const tagName = parentStylingElement.tagName // styling tag name

    // Clone nội dung của 3 đoạn: trái | selection | phải (không đụng DOM gốc)
    const clonedRange = selectionRange.cloneRange()

    const leftRange = doc.createRange()
    leftRange.setStart(parentStylingElement, 0)
    leftRange.setEnd(clonedRange.startContainer, clonedRange.startOffset)

    const rightRange = doc.createRange()
    rightRange.setStart(clonedRange.endContainer, clonedRange.endOffset)
    rightRange.setEnd(parentStylingElement, parentStylingElement.childNodes.length)

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
      replacement.appendChild(midFragment) // KHÔNG bị bọc bởi styling tag
    }

    if (rightFragment.hasChildNodes()) {
      const rightElement = doc.createElement(tagName)
      rightElement.appendChild(rightFragment)
      replacement.appendChild(rightElement)
    }

    // Thay thẻ cha <styling tag> cũ bằng cấu trúc mới
    parentStylingElement.replaceWith(replacement)
  }

  private warpContentByStylingTag(selectionRange: Range): HTMLElement {
    const content = selectionRange.extractContents()
    const element = document.createElement(this.getCurrentStylingTagName())
    element.appendChild(content)
    selectionRange.insertNode(element)
    return element
  }

  private findDescendantsSameTag(parent: HTMLElement): HTMLElement[] {
    const tagName = parent.tagName
    // liệt kê tất cả các tagName cùng loại với tagName của parent
    const descendantTagNames: string[] = []
    for (const stylingType in this.tagNamesForStyling) {
      const tagNames = this.tagNamesForStyling[stylingType as ETextStylingType]
      if (tagNames.includes(tagName)) {
        descendantTagNames.push(...tagNames)
      }
    }
    // tìm tất cả các phần tử có tagName cùng loại với tagName của parent
    return Array.from(parent.querySelectorAll(descendantTagNames.join(",")))
  }

  private removeOverlapChildTags(parentStylingElement: HTMLElement): void {
    const descendants = this.findDescendantsSameTag(parentStylingElement)
    for (const descendant of descendants) {
      descendant.replaceWith(...descendant.childNodes)
    }
  }

  /**
   * Kiểm tra xem phần tử parent có text node nào không nằm trong tagNameAllowed hay không
   * @param {HTMLElement} parent - Phần tử parent
   */
  private makeStylingToTextNodeOutsideTags(parent: HTMLElement): void {
    const tagNamesAllowed = this.getAllAvailableTagNames()
    const childNodes = parent.childNodes
    for (const node of childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent!.trim() !== "") {
          // tìm ra text node không có tag bao bọc
          const newNode = document.createElement(this.getCurrentStylingTagName())
          newNode.appendChild(node.cloneNode(true))
          node.replaceWith(newNode)
          return
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        // nếu không phải tag được phép thì kiểm tra tiếp đệ quy
        if (!tagNamesAllowed.includes(el.tagName)) {
          this.makeStylingToTextNodeOutsideTags(el)
        } else {
          // nếu nằm trong tag được phép, bỏ qua đệ quy
          continue
        }
      }
    }
  }

  private removeEmptyTags(parent: HTMLElement): void {
    const elements = parent.children
    for (const element of elements) {
      if (element.innerHTML === "") {
        element.remove()
        continue
      } else if (element.hasChildNodes()) {
        this.removeEmptyTags(element as HTMLElement)
      }
    }
  }

  private makeStyling(selectionRange: Range, stylingType: ETextStylingType): void {
    this.setCurrentStylingType(stylingType)
    this.setParentStylingElement(selectionRange)

    if (this.parentStylingElement) {
      // check xem selection có nằm hoàn toàn trong 1 styling tag không
      this.unstylingFromSelection(selectionRange)
    } else {
      // nếu không nằm hoàn toàn trong styling tag thì bọc content bởi styling tag và xóa các tag giống styling tag
      const parentStylingElement = this.warpContentByStylingTag(selectionRange)
      this.removeOverlapChildTags(parentStylingElement)
    }

    if (this.parentStylingElement) {
      this.mergeAdjacentStyling(this.parentStylingElement)
    }
  }

  onAction(stylingType: ETextStylingType): void {
    const selection = editorContent.checkIsFocusingInEditorContent()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (range.collapsed) return
    this.makeStyling(range, stylingType)
  }
}

export const textStylingStylish = new TextStylingStylish()
