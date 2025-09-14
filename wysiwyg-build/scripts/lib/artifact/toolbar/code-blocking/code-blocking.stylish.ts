import { ECodeBlockingLanguage, EErrorMessage } from "@/enums/global-enums"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper"
import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import Prism from "prismjs"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
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
    const topBlockElement = CodeVCNEditorHelper.getTopBlockElementFromNode(codeBlockParent)
    if (!topBlockElement) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.TOP_BLOCK_NOT_FOUND)
    }
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    CodeVCNEditorHelper.moveCaretToPreviousTopBlock(selection)
  }

  jumpToNewLineFromInsideCodeBlock(codeBlockParent: HTMLElement): void {
    const topBlockElement = CodeVCNEditorHelper.getTopBlockElementFromNode(codeBlockParent)
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

  private wrapSelectionByInlineCodeBlock(
    selection: Selection,
    language: ECodeBlockingLanguage = ECodeBlockingLanguage.CPP
  ): void {
    const content = selection.getRangeAt(0).extractContents()
    const inlineCodeBlockElement = document.createElement(this.inlineCodeBlockElementTagName)
    inlineCodeBlockElement.className = this.generateInlineCodeBlockClassName(language)
    inlineCodeBlockElement.appendChild(content)
    selection.getRangeAt(0).insertNode(inlineCodeBlockElement)
    Prism.highlightElement(inlineCodeBlockElement)
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
