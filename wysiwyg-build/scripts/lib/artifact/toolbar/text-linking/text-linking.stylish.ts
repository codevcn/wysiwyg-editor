import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import { editorContent } from "../../content/editor.content"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper"
import { EErrorMessage, EInternalEvents } from "@/enums/global-enums"
import type { TOnSaveLink } from "@/types/api-types"
import { eventEmitter } from "../../event/event-emitter"
import { textStylingStylish } from "../text-styling/text-styling.stylish"

type TInsertType = "insert-new" | "wrap-existing"

type TShowLinkModalHandler = (
  link: string | null,
  textOfLink: string | null,
  textLinkElement: HTMLAnchorElement | null,
  onSaveLink: TOnSaveLink
) => void

class TextLinkingStylish {
  private readonly linkTagName: string = "A"

  constructor() {}

  getTextLinkTagName(): string {
    return this.linkTagName
  }

  private createTextLinkElement(link: string, innerHTML: string): HTMLAnchorElement {
    const textLinkElement = document.createElement(this.linkTagName) as HTMLAnchorElement
    textLinkElement.setAttribute("href", link)
    textLinkElement.setAttribute("target", "_blank")
    textLinkElement.setAttribute("rel", "noopener noreferrer")
    const boldElement = document.createElement(textStylingStylish.getBoldTagNameMostPrioritied())
    boldElement.innerHTML = innerHTML
    textLinkElement.replaceChildren(boldElement)
    return textLinkElement
  }

  updateLink(link: string, textOfLink: string | null, textLinkElement: HTMLAnchorElement): void {
    textLinkElement.setAttribute("href", link)
    textLinkElement.textContent = textOfLink || link
  }

  /**
   * Kiểm tra xem caret có nằm trên text link không, dùng được cho cả khi bôi đen và khi ko bôi đen
   */
  private checkIfIsOnTextLink(selection: Selection): HTMLAnchorElement | null {
    let anchorNode = selection.anchorNode
    if (anchorNode && anchorNode.nodeType === Node.TEXT_NODE) {
      anchorNode = anchorNode.parentElement
    }
    if (!anchorNode || !(anchorNode instanceof HTMLElement)) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.ANCHOR_NODE_NOT_FOUND_OR_NOT_ELEMENT)
    }
    if (anchorNode.tagName === this.linkTagName) {
      return anchorNode as HTMLAnchorElement
    }
    return CodeVCNEditorHelper.getClosestElementOfNode<HTMLAnchorElement>(
      anchorNode,
      (element) => element.tagName === this.linkTagName
    )
  }

  private insertNewLinkToCurrentCaret(link: string, textOfLink: string, selection: Selection, type: TInsertType): void {
    const range = selection.getRangeAt(0)
    const textLinkElement = this.createTextLinkElement(link, textOfLink)
    if (type === "wrap-existing") {
      range.deleteContents()
    }
    eventEmitter.emit(EInternalEvents.BIND_TEXT_LINK_POPOVER_EVENT, textLinkElement)
    range.insertNode(textLinkElement)
  }

  private showModalToUpdateLink(textLinkElement: HTMLAnchorElement, showLinkModalHandler: TShowLinkModalHandler): void {
    showLinkModalHandler(
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
  }

  private showModalToMakeNewLink(
    showLinkModalHandler: TShowLinkModalHandler,
    selection: Selection,
    type: TInsertType
  ): void {
    showLinkModalHandler(
      null,
      type === "insert-new" ? null : selection.getRangeAt(0).cloneContents().textContent,
      null,
      (link, textOfLink) => {
        if (link) {
          const trimmedLink = link.trim()
          if (trimmedLink.length > 0) {
            const selection = CodeVCNEditorHelper.restoreCaretPosition()
            if (selection) {
              this.insertNewLinkToCurrentCaret(trimmedLink, textOfLink || trimmedLink, selection, type)
            }
          }
        }
      }
    )
  }

  private makeLinking(showLinkModalHandler: TShowLinkModalHandler): void {
    const selection = editorContent.checkIsFocusingInEditorContent()
    if (!selection) return
    CodeVCNEditorHelper.saveCurrentCaretPosition(selection)
    if (CodeVCNEditorHelper.isSelectingText()) {
      const textLinkElement = this.checkIfIsOnTextLink(selection)
      if (textLinkElement) {
        this.showModalToUpdateLink(textLinkElement, showLinkModalHandler)
      } else {
        this.showModalToMakeNewLink(showLinkModalHandler, selection, "wrap-existing")
      }
    } else {
      const textLinkElement = this.checkIfIsOnTextLink(selection)
      if (textLinkElement) {
        this.showModalToUpdateLink(textLinkElement, showLinkModalHandler)
      } else {
        this.showModalToMakeNewLink(showLinkModalHandler, selection, "insert-new")
      }
    }
  }

  onAction(showLinkModalHandler: TShowLinkModalHandler) {
    this.makeLinking(showLinkModalHandler)
  }
}

export const textLinkingStylish = new TextLinkingStylish()
