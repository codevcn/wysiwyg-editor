import { ECodeBlockingLanguage, EErrorMessage } from "@/enums/global-enums"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper"
import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import Prism from "prismjs"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-python"

type TInitCodeBlockHandler = (selection: Selection) => void

type TInlineCodeBlockClassName = `language-${string}`

class CodeBlockingStylish {
  private readonly codeBlockBoxElementTagName: string = "DIV"
  private readonly codeBlockBoxClassName: string = "NAME-code-block-box"
  private readonly inlineCodeBlockElementTagName: string = "CODE"

  constructor() {}

  getCodeBlockBoxElementTagName(): string {
    return this.codeBlockBoxElementTagName
  }

  getCodeBlockBoxClassName(): string {
    return this.codeBlockBoxClassName
  }

  jumpToPreviousLineFromInsideCodeBlock(codeBlockParent: HTMLElement): void {
    const topBlockElement = CodeVCNEditorHelper.getTopBlockElementFromElement(codeBlockParent)
    if (!topBlockElement) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.TOP_BLOCK_NOT_FOUND)
    }
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    CodeVCNEditorHelper.moveCaretToPreviousTopBlock(selection)
  }

  jumpToNewLineFromInsideCodeBlock(codeBlockParent: HTMLElement): void {
    const topBlockElement = CodeVCNEditorHelper.getTopBlockElementFromElement(codeBlockParent)
    if (!topBlockElement) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.TOP_BLOCK_NOT_FOUND)
    }
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    CodeVCNEditorHelper.moveCaretToStartOfNextTopBlock(selection)
  }

  private generateInlineCodeBlockClassName(language: ECodeBlockingLanguage): TInlineCodeBlockClassName {
    return `language-${language.toLowerCase()}`
  }

  private createNewInlineCodeBlockElement(language: ECodeBlockingLanguage = ECodeBlockingLanguage.CPP): HTMLElement {
    const inlineCodeBlockElement = document.createElement(this.inlineCodeBlockElementTagName)
    inlineCodeBlockElement.className = this.generateInlineCodeBlockClassName(language)
    return inlineCodeBlockElement
  }

  private checkIfSelectionIsInsideCodeBlock(selection: Selection): boolean {
    let startContainer: Node | null = selection.getRangeAt(0).startContainer
    if (startContainer?.nodeType === Node.TEXT_NODE) {
      startContainer = startContainer.parentElement
    }
    if (!startContainer || !(startContainer instanceof HTMLElement)) return false
    return !!CodeVCNEditorHelper.getClosestParentOfElement(
      startContainer,
      (node) => node.tagName === this.codeBlockBoxElementTagName
    )
  }

  private highlightCodeBlockAfterWrapping(
    wrapperAfter: HTMLElement | undefined,
    wrapperBefore: HTMLElement | undefined | null,
    relatedTopBlocks: HTMLElement[] | undefined
  ): void {
    if (wrapperAfter) {
      Prism.highlightElement(wrapperAfter)
    }
    if (wrapperBefore) {
      Prism.highlightElement(wrapperBefore)
    }
    if (relatedTopBlocks && relatedTopBlocks.length > 0) {
      for (const topBlock of relatedTopBlocks) {
        Prism.highlightElement(topBlock)
      }
    }
  }

  insertNewTopBlockForCodeBlock(initCodeBlockHandler: TInitCodeBlockHandler): void {
    let selection = CodeVCNEditorHelper.restoreCaretPosition()
    if (!selection) {
      selection = CodeVCNEditorHelper.focusCaretAtEndOfEditorContent()
    }
    if (!selection) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.SELECTION_NOT_FOUND_AFTER_RESTORE)
    }
    if (CodeVCNEditorHelper.isSelectingContent()) {
      if (this.checkIfSelectionIsInsideCodeBlock(selection)) {
        return
      } else {
        const result = CodeVCNEditorHelper.wrapSelectionInMultipleLinesByWrapper(
          selection,
          this.createNewInlineCodeBlockElement(ECodeBlockingLanguage.CPP)
        )
        this.highlightCodeBlockAfterWrapping(result?.wrapperAfter, result?.wrapperBefore, result?.relatedTopBlocks)
      }
    } else {
      const { topBlockElement, isEmpty } = CodeVCNEditorHelper.isEmptyTopBlock(selection)
      if (topBlockElement) {
        if (!isEmpty) {
          CodeVCNEditorHelper.splitCurrentTopBlockElementAtCaret(selection, true)
        }
        initCodeBlockHandler(selection)
      }
    }
  }
}

export const codeBlockingStylish = new CodeBlockingStylish()
