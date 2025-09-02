import { editorContent } from "../../content/editor-content"
import { ETextStylingType } from "@/enums/global-enums"

let count = 0

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

  private ifTagNameIsCurrentStyling(tagName: string): boolean {
    return this.tagNamesForStyling[this.currentStylingType!].includes(tagName)
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
    const editorContentElement = editorContent.getContentElement()
    while (node && editorContentElement.contains(node)) {
      if (this.ifTagNameIsCurrentStyling(node.tagName) && node.contains(selectionRange.endContainer)) {
        this.parentStylingElement = node
        return
      }
      node = node.parentNode as HTMLElement
    }
    this.parentStylingElement = null
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

  private findDescendantsSameTag(parent: HTMLElement): HTMLElement[] {
    const tagName = parent.tagName
    return Array.from(parent.querySelectorAll(tagName))
  }

  private warpContentByStylingTag(selectionRange: Range): HTMLElement {
    const content = selectionRange.extractContents()
    const element = document.createElement(this.getCurrentStylingTagName())
    element.appendChild(content)
    selectionRange.insertNode(element)
    return element
  }

  private removeOverlapChildTags(parentStylingElement: HTMLElement): void {
    const descendants = this.findDescendantsSameTag(parentStylingElement)
    for (const descendant of descendants) {
      descendant.replaceWith(...descendant.childNodes)
    }
  }

  /**
   * Kiểm tra xem phần tử parent có text node nào không nằm trong tagNameAllowed hay không
   * @param {HTMLElement} parent - Phần tử gốc
   * @param {string[]} tagNamesAllowed - danh sách tagName được phép chứa text
   */
  private makeStylingToTextNodeOutsideTags(parent: HTMLElement, tagNamesAllowed: string[]): void {
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
          this.makeStylingToTextNodeOutsideTags(el, tagNamesAllowed)
        } else {
          // nếu nằm trong tag được phép, bỏ qua đệ quy
          continue
        }
      }
    }
  }

  public makeStyling(selection: Selection, stylingType: ETextStylingType): void {
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (range.collapsed) return

    console.log(">>> vcn-id:", document.querySelector(".vcn-id"))
    count++

    this.setCurrentStylingType(stylingType)
    this.setParentStylingElement(range)
    console.log(">>> 151:", this.parentStylingElement)

    // if (count !== 1) {
    //   return
    // }
    if (this.parentStylingElement) {
      // check xem selection có nằm hoàn toàn trong 1 styling tag không
      console.log(">>> run this 189")
      this.unstylingFromSelection(range)
    }
    // nếu không nằm hoàn toàn trong styling tag thì bọc content bởi styling tag và xóa các tag giống styling tag
    else {
      console.log(">>> run this 170")
      const parentStylingElement = this.warpContentByStylingTag(range)
      this.removeOverlapChildTags(parentStylingElement)
      this.makeStylingToTextNodeOutsideTags(parentStylingElement, this.getCurrentStylingTagNames())
    }

    if (this.parentStylingElement) {
      this.mergeAdjacentStyling(this.parentStylingElement)
    }
  }
}

export const textStylingStylish = new TextStylingStylish()
