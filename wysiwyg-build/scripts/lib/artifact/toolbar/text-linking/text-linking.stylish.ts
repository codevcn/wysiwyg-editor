import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import { editorContent } from "../../content/editor.content"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper"
import { EErrorMessage } from "@/enums/global-enums"
import { textLinkingManager } from "./text-linking.manager"

type TShowLinkModalHandler = () => void

class TextLinkingStylish {
  private readonly linkTagName: string = "A"
  private savedRange: Range | null = null

  constructor() {}

  getTextLinkTagName(): string {
    return this.linkTagName
  }

  private createTextLinkElement(link: string, innerHTML: string): HTMLElement {
    const textLinkElement = document.createElement(this.linkTagName)
    textLinkElement.setAttribute("href", link)
    textLinkElement.innerHTML = innerHTML
    textLinkElement.setAttribute("target", "_blank")
    textLinkElement.setAttribute("rel", "noopener noreferrer")
    return textLinkElement
  }

  updateLink(link: string, textOfLink: string | null, textLinkElement: HTMLLinkElement): void {
    textLinkElement.setAttribute("href", link)
    textLinkElement.textContent = textOfLink || link
  }

  /**
   * Kiểm tra xem caret có nằm trên text link không, dùng được cho cả khi bôi đen và khi ko bôi đen
   */
  private checkIfIsOnTextLink(selection: Selection): HTMLLinkElement | null {
    let anchorNode = selection.anchorNode
    if (anchorNode && anchorNode.nodeType === Node.TEXT_NODE) {
      anchorNode = anchorNode.parentElement
    }
    if (!anchorNode || !(anchorNode instanceof HTMLElement)) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.ANCHOR_NODE_NOT_FOUND_OR_NOT_ELEMENT)
    }
    if (anchorNode.tagName === this.linkTagName) {
      return anchorNode as HTMLLinkElement
    }
    return CodeVCNEditorHelper.getClosestElementOfNode<HTMLLinkElement>(
      anchorNode,
      (element) => element.tagName === this.linkTagName
    )
  }

  private insertNewLinkToCurrentCaret(link: string, textOfLink: string, selection: Selection): void {
    const range = selection.getRangeAt(0)
    range.insertNode(this.createTextLinkElement(link, textOfLink))
  }

  private saveCurrentCaretPosition(selection: Selection): void {
    this.savedRange = selection.getRangeAt(0)
  }

  private restoreCaretPosition(): Selection | null {
    if (this.savedRange) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(this.savedRange)
        return selection
      }
    }
    return null
  }

  private makeLinking(showLinkModalHandler: TShowLinkModalHandler): void {
    const selection = editorContent.checkIsFocusingInEditorContent()
    if (!selection) return
    this.saveCurrentCaretPosition(selection)
    if (CodeVCNEditorHelper.isSelectingText()) {
    } else {
      const textLinkElement = this.checkIfIsOnTextLink(selection)
      if (textLinkElement) {
        textLinkingManager.showModalOnAction(
          textLinkElement.getAttribute("href"),
          textLinkElement.textContent,
          textLinkElement,
          (link, textOfLink) => {
            if (link) {
              const trimmedLink = link.trim()
              if (trimmedLink.length > 0) {
                this.updateLink(trimmedLink, textOfLink, textLinkElement)
              }
            }
          }
        )
      } else {
        textLinkingManager.showModalOnAction(null, null, null, (link, textOfLink) => {
          if (link) {
            const trimmedLink = link.trim()
            if (trimmedLink.length > 0) {
              const selection = this.restoreCaretPosition()
              if (selection) {
                this.insertNewLinkToCurrentCaret(trimmedLink, textOfLink || trimmedLink, selection)
              }
            }
          }
        })
      }
    }
  }

  onAction(showLinkModalHandler: TShowLinkModalHandler) {
    this.makeLinking(showLinkModalHandler)
  }
}

export const textLinkingStylish = new TextLinkingStylish()
