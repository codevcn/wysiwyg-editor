import { ETextListingType } from "@/enums/global-enums"
import { DOMHelpers } from "../../helpers/DOMHelpers"
import { editorContent } from "../../content/editor-content"

type TGetListTypeAtCaretResult = {
  listingType: ETextListingType
  liElement: HTMLElement
} | null

class TextListingStylish {
  private currentTagName: string = ""
  private isNowEmptyLine: boolean = false

  constructor() {}

  private setCurrentTagName(listingType: ETextListingType): void {
    this.currentTagName = listingType === ETextListingType.NUMBERED_LIST ? "OL" : "UL"
  }

  private setIsNowEmptyLine(isNowEmptyLine: boolean): void {
    this.isNowEmptyLine = isNowEmptyLine
  }

  private getClosestListLineElement(selection: Selection): HTMLElement | null {
    if (!selection || selection.rangeCount === 0) return null

    let node = selection.anchorNode
    if (node && node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode // nếu caret nằm trong text thì lấy cha
    }

    const li = node && (node as HTMLElement).closest("li")
    if (editorContent.getContentElement().contains(li)) {
      return li
    }
    return null
  }

  private createNewLine(currentLiElement: HTMLElement, selection: Selection): void {
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
    return liElement.innerHTML === "<br>" || liElement.innerHTML === ""
  }

  private deleteLine(liElement: HTMLElement): void {
    liElement.remove()
    editorContent.insertNewTopBlockElementAndFocusCaret()
  }

  private isOnListLine(): boolean {
    return !!this.currentTagName
  }

  private wrapTopBlockByListingLine(topBlockElement: HTMLElement): void {
    const topBlockChildNodes = topBlockElement.childNodes
    const ol = document.createElement(this.currentTagName)
    const li = document.createElement("li")
    li.innerHTML = "<br>"
    li.replaceChildren(...topBlockChildNodes)
    ol.appendChild(li)
    topBlockElement.replaceChildren(ol)
  }

  private makeListing(selection: Selection) {
    const listLineElement = this.getClosestListLineElement(selection)
    if (listLineElement) {
      if (this.isOnEmptyLine(listLineElement)) {
        this.deleteLine(listLineElement)
      } else {
        this.createNewLine(listLineElement, selection)
      }
    } else {
      const anchorNode = selection.anchorNode!
      const topBlockElement = DOMHelpers.getTopBlockElementFromNode(
        anchorNode.nodeType === Node.TEXT_NODE ? (anchorNode.parentNode as HTMLElement) : (anchorNode as HTMLElement)
      )
      if (topBlockElement) {
        this.wrapTopBlockByListingLine(topBlockElement)
      }
    }
  }

  private makeListingOnToolbarButtonClick(listingType: ETextListingType): void {
    const selection = editorContent.checkIsFocusingInEditorContent()
    if (!selection || selection.rangeCount === 0) return
    this.setCurrentTagName(listingType)
    this.makeListing(selection)
  }

  private makeListingOnKeyboardEvent(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      e.preventDefault()
      const selection = editorContent.checkIsFocusingInEditorContent()
      if (!selection || selection.rangeCount === 0) return
      this.makeListing(selection)
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
