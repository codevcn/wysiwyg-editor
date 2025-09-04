import { ETextListingType } from "@/enums/global-enums"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper.js"
import { editorContent } from "@/lib/artifact/content/editor.content.js"

class TextListingStylish {
  private currentTagName: string = ""

  constructor() {}

  private setCurrentTagName(listingType: ETextListingType): void {
    this.currentTagName = listingType === ETextListingType.NUMBERED_LIST ? "OL" : "UL"
  }

  private getClosestListLineElement(selection?: Selection | null): HTMLElement | null {
    if (!selection || selection.rangeCount === 0) return null

    let elementOfSelection: HTMLElement
    const node = selection.anchorNode
    if (node && node.nodeType === Node.TEXT_NODE) {
      elementOfSelection = node.parentNode as HTMLElement // nếu caret nằm trong text thì lấy cha
    } else {
      elementOfSelection = node as HTMLElement
    }

    const editorContentElement = editorContent.getContentElement()
    if (elementOfSelection.tagName === "LI") {
      if (editorContentElement.contains(elementOfSelection)) {
        return elementOfSelection
      }
    } else if (elementOfSelection.tagName === this.currentTagName) {
      return elementOfSelection.lastElementChild as HTMLElement
    }
    return null
  }

  private insertNewLine(currentLiElement: HTMLElement, selection: Selection): void {
    // Tách selection ra khỏi li hiện tại
    const range = selection.getRangeAt(0)
    const after = range.extractContents()

    // Tạo li mới
    const newLi = document.createElement("li")
    if (!after.textContent) {
      newLi.innerHTML = "<br>" // giữ caret hiển thị
    } else {
      newLi.appendChild(after)
    }

    // Chèn vào sau li hiện tại
    currentLiElement.insertAdjacentElement("afterend", newLi)

    // Đặt caret vào li mới
    const newRange = document.createRange()
    newRange.setStart(newLi, 0)
    newRange.collapse(true)
    selection.removeAllRanges()
    selection.addRange(newRange)
  }

  private isOnEmptyLine(liElement: HTMLElement): boolean {
    const trimmedInnerHTML = liElement.innerHTML.trim()
    return trimmedInnerHTML === "<br>" || trimmedInnerHTML === ""
  }

  private deleteLine(liElement: HTMLElement): void {
    liElement.remove()
  }

  private isOnListLine(): boolean {
    return !!this.currentTagName
  }

  private createNewList(...nodes: Node[]): HTMLElement {
    const list = document.createElement(this.currentTagName)
    const line = document.createElement("li")
    line.innerHTML = "<br>"
    if (nodes.length > 0) {
      line.replaceChildren(...nodes)
    }
    list.appendChild(line)
    return list
  }

  private wrapElementContentByNewList(element: HTMLElement): void {
    element.replaceChildren(this.createNewList(...element.childNodes))
  }

  /**
   * Tạo danh sách: Nếu caret nằm trong li thì tạo li mới, nếu li hiện tại rỗng thì xóa li, nếu caret nằm ngoài li thì tạo danh sách
   * @param selection Selection của user
   */
  private makeListing(selection: Selection) {
    const listLineElement = this.getClosestListLineElement(selection)
    if (listLineElement) {
      if (this.isOnEmptyLine(listLineElement)) {
        this.deleteLine(listLineElement)
      } else {
        this.insertNewLine(listLineElement, selection)
      }
    } else {
      const anchorNode = selection.anchorNode!
      const topBlockElement = CodeVCNEditorHelper.getTopBlockElementFromNode(
        anchorNode.nodeType === Node.TEXT_NODE ? (anchorNode.parentNode as HTMLElement) : (anchorNode as HTMLElement)
      )
      if (topBlockElement) {
        this.wrapElementContentByNewList(topBlockElement)
      }
    }
  }

  private insertNewListInsideLine(lineElement: HTMLElement): void {
    const newList = this.createNewList()
    lineElement.appendChild(newList)
  }

  private makeNestedListing(selection: Selection): void {
    const listLineElement = this.getClosestListLineElement(selection)
    if (listLineElement) {
      if (this.isOnEmptyLine(listLineElement)) {
        this.deleteLine(listLineElement)
        const selection = window.getSelection()
        const currentLineElement = this.getClosestListLineElement(selection)
        if (currentLineElement) {
          this.insertNewListInsideLine(currentLineElement)
        }
      }
    }
  }

  private makeListingOnToolbarButtonClick(listingType: ETextListingType): void {
    const selection = editorContent.checkIsFocusingInEditorContent()
    if (!selection) return
    this.setCurrentTagName(listingType)
    this.makeListing(selection)
  }

  private makeListingOnKeyboardEvent(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      e.preventDefault()
      const selection = editorContent.checkIsFocusingInEditorContent()
      if (!selection) return
      this.makeListing(selection)
    } else if (e.key === "Tab") {
      e.preventDefault()
      const selection = editorContent.checkIsFocusingInEditorContent()
      if (!selection) return
      this.makeNestedListing(selection)
    }
  }

  onAction(listingType?: ETextListingType, e?: KeyboardEvent): void {
    if (listingType) {
      this.makeListingOnToolbarButtonClick(listingType)
    } else if (e && this.isOnListLine()) {
      this.makeListingOnKeyboardEvent(e)
    }
  }
}

export const textListingStylish = new TextListingStylish()
