import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import { CodeVCNEditorEngine } from "../../engine/codevcn-editor.engine"
import { EErrorMessage } from "@/enums/global-enums"

class TablePlacingStylish {
  private readonly tableCellTagName: string = "TD"
  private readonly tableTagName: string = "TABLE"
  private readonly tableRowTagName: string = "TR"
  private readonly tableBodyTagName: string = "TBODY"

  constructor() {}

  getTableCellTagName(): string {
    return this.tableCellTagName
  }

  getTableTagName(): string {
    return this.tableTagName
  }

  getTableRowTagName(): string {
    return this.tableRowTagName
  }

  getTableBodyTagName(): string {
    return this.tableBodyTagName
  }

  insertNewTableIntoCurrentCaret(tableElement: HTMLElement): void {
    CodeVCNEditorEngine.restoreCaretPosition()
    let selection = CodeVCNEditorEngine.checkIsFocusingInEditorContent()
    if (!selection) {
      CodeVCNEditorEngine.focusCaretAtEndOfEditorContent()
      selection = CodeVCNEditorEngine.checkIsFocusingInEditorContent()
      if (!selection) {
        throw EditorInternalErrorHelper.createError(EErrorMessage.SELECTION_NOT_FOUND_AFTER_RESTORE)
      }
    }
    const { topBlockElement, isEmpty } = CodeVCNEditorEngine.isEmptyTopBlock(selection)
    if (topBlockElement) {
      if (!isEmpty) {
        CodeVCNEditorEngine.insertNewTopBlockElementAfterElement(selection, topBlockElement)
      }
      CodeVCNEditorEngine.insertElementAtCaret(tableElement, selection)
      const firstCellElement = tableElement.querySelector<HTMLElement>(this.tableCellTagName)
      if (firstCellElement) {
        CodeVCNEditorEngine.moveCaretToElement(firstCellElement, selection, selection.getRangeAt(0), "end")
      }
    }
  }
}

export const tablePlacingStylish = new TablePlacingStylish()
