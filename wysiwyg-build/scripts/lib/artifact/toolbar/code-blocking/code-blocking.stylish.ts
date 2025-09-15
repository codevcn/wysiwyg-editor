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

  private wrapRangeContentByInlineCodeBlock(
    range: Range,
    language: ECodeBlockingLanguage = ECodeBlockingLanguage.CPP
  ): HTMLElement {
    const content = range.extractContents()
    const inlineCodeBlockElement = this.createNewInlineCodeBlockElement(language)
    inlineCodeBlockElement.appendChild(content)
    range.insertNode(inlineCodeBlockElement)
    return inlineCodeBlockElement
  }

  private wrapSelectionByInlineCodeBlock(
    selection: Selection,
    language: ECodeBlockingLanguage = ECodeBlockingLanguage.CPP
  ): void {
    const topBlocks = CodeVCNEditorHelper.getSelectedTopBlocks(selection)
    if (!topBlocks) return
    if (topBlocks.length > 1) {
      const range = selection.getRangeAt(0)

      const firstTopBlock = topBlocks[0]
      const clonedAfterRange = range.cloneRange()
      clonedAfterRange.setEnd(firstTopBlock, firstTopBlock.childNodes.length)
      const inlineCodeBlockElementAfter = this.wrapRangeContentByInlineCodeBlock(clonedAfterRange, language)
      Prism.highlightElement(inlineCodeBlockElementAfter)

      const lastTopBlock = topBlocks[topBlocks.length - 1]
      const clonedBeforeRange = range.cloneRange()
      clonedBeforeRange.setStart(lastTopBlock, 0)
      const inlineCodeBlockElementBefore = this.wrapRangeContentByInlineCodeBlock(clonedBeforeRange, language)
      Prism.highlightElement(inlineCodeBlockElementBefore)

      const otherTopBlocks = topBlocks.slice(1, topBlocks.length - 1)
      for (const topBlock of otherTopBlocks) {
        const inlineCodeBlockElement = this.createNewInlineCodeBlockElement(language)
        CodeVCNEditorHelper.wrapElementContentsByEmptyElement(topBlock, inlineCodeBlockElement)
        Prism.highlightElement(inlineCodeBlockElement)
      }
    } else if (topBlocks.length === 1) {
      const inlineCodeBlockElement = this.wrapRangeContentByInlineCodeBlock(selection.getRangeAt(0), language)
      Prism.highlightElement(inlineCodeBlockElement)
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
      this.wrapSelectionByInlineCodeBlock(selection)
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
