import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import { editorContent } from "../../content/editor.content"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper"
import { EErrorMessage } from "@/enums/global-enums"
import { textLinkingManager } from "./text-linking.manager"

class TextLinkingStylish {
  private readonly textLinkTagName: string = "A"
  private savedRange: Range | null = null

  constructor() {}

  getTextLinkTagName(): string {
    return this.textLinkTagName
  }

  private createTextLinkElement(link: string, innerHTML: string): HTMLElement {
    const textLinkElement = document.createElement(this.textLinkTagName)
    textLinkElement.setAttribute("href", link)
    textLinkElement.innerHTML = innerHTML
    textLinkElement.setAttribute("target", "_blank")
    textLinkElement.setAttribute("rel", "noopener noreferrer")
    textLinkElement.addEventListener("click", (e) => {
      e.preventDefault()
      window.open(link, "_blank")
    })
    return textLinkElement
  }

  /**
   * Kiểm tra xem caret có nằm trên text link không, dùng được cho cả khi bôi đen và khi ko bôi đen
   */
  private checkIfIsOnTextLink(selection: Selection): boolean {
    let anchorNode = selection.anchorNode
    if (anchorNode && anchorNode.nodeType === Node.TEXT_NODE) {
      anchorNode = anchorNode.parentElement
    }
    if (!anchorNode) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.ANCHOR_NODE_NOT_FOUND)
    }
    return !!CodeVCNEditorHelper.getClosestElementOfNode(
      anchorNode as HTMLElement,
      (element) => element.tagName === this.textLinkTagName
    )
  }

  private insertNewLinkToCurrentCaret(link: string, textOfLink: string, selection: Selection): void {
    const range = selection.getRangeAt(0)
    range.insertNode(this.createTextLinkElement(link, textOfLink))
  }

  private saveCurrentCaretPosition(selection: Selection): void {
    this.savedRange = selection.getRangeAt(0)
  }

  private restoreCaretPosition(): void {
    if (this.savedRange) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(this.savedRange)
      }
    }
  }

  private makeLinking(): void {
    const selection = editorContent.checkIsFocusingInEditorContent()
    if (!selection) return
    this.saveCurrentCaretPosition(selection)
    if (CodeVCNEditorHelper.isSelectingText()) {
    } else {
      textLinkingManager.showModalOnAction("", (link, textOfLink) => {
        if (link && link.trim().length > 0) {
          this.restoreCaretPosition()
          this.insertNewLinkToCurrentCaret(link, textOfLink || link, selection)
        }
      })
    }
  }

  onAction() {
    this.makeLinking()
  }
}

export const textLinkingStylish = new TextLinkingStylish()
