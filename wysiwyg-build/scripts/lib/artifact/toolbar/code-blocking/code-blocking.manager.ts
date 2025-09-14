import { ECodeBlockingLanguage, EErrorMessage } from "@/enums/global-enums"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper"
import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import { CodeBlockViewManager } from "./code-block-view.manager"

class CodeBlockingManager {
  private readonly codeBlockBoxElementTagName: string = "DIV"
  private readonly codeBlockBoxClassName: string = "NAME-code-block-box"
  private readonly codeBlockViewManager: CodeBlockViewManager

  constructor() {
    this.codeBlockViewManager = new CodeBlockViewManager(this.codeBlockBoxElementTagName, this.codeBlockBoxClassName)
  }

  getCodeBlockBoxClassName(): string {
    return this.codeBlockBoxClassName
  }

  private async initCodeBlockView(
    selection: Selection,
    language: ECodeBlockingLanguage,
    isDarkTheme = false
  ): Promise<void> {
    await this.codeBlockViewManager.initCodeBlockView(selection, language, isDarkTheme)
  }

  private insertNewCodeBlock(language: ECodeBlockingLanguage, isDarkTheme = false): void {
    let selection = CodeVCNEditorHelper.restoreCaretPosition()
    if (!selection) {
      selection = CodeVCNEditorHelper.focusCaretAtEndOfEditorContent()
    }
    if (!selection) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.SELECTION_NOT_FOUND_AFTER_RESTORE)
    }
    const { topBlockElement, isEmpty } = CodeVCNEditorHelper.isEmptyTopBlock(selection)
    if (topBlockElement) {
      if (!isEmpty) {
        CodeVCNEditorHelper.splitCurrentTopBlockElementAtCaret(selection, true)
      }
      this.initCodeBlockView(selection, language, isDarkTheme)
    }
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

  insertCodeBlockForEditing(language: ECodeBlockingLanguage = ECodeBlockingLanguage.CPP, isDarkTheme = false) {
    this.insertNewCodeBlock(language, isDarkTheme)
  }
}

export const codeBlockingManager = new CodeBlockingManager()
