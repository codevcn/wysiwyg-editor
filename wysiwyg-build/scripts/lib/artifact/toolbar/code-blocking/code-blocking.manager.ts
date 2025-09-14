import { ECodeBlockingLanguage } from "@/enums/global-enums.js"
import { CodeBlockViewManager } from "./code-block-view.manager.js"
import { codeBlockingStylish } from "./code-blocking.stylish.js"

class CodeBlockingManager {
  private readonly codeBlockViewManager: CodeBlockViewManager

  constructor() {
    this.codeBlockViewManager = new CodeBlockViewManager(
      codeBlockingStylish.getCodeBlockBoxElementTagName(),
      codeBlockingStylish.getCodeBlockBoxClassName()
    )
  }

  private async initCodeBlockView(
    selection: Selection,
    language: ECodeBlockingLanguage,
    isDarkTheme = false
  ): Promise<void> {
    await this.codeBlockViewManager.initCodeBlockView(selection, language, isDarkTheme)
  }

  private insertNewCodeBlock(language: ECodeBlockingLanguage, isDarkTheme = false): void {
    codeBlockingStylish.insertNewTopBlockForCodeBlock((selection) => {
      this.initCodeBlockView(selection, language, isDarkTheme)
    })
  }

  insertCodeBlockForEditing(language: ECodeBlockingLanguage = ECodeBlockingLanguage.CPP, isDarkTheme = false) {
    this.insertNewCodeBlock(language, isDarkTheme)
  }
}

export const codeBlockingManager = new CodeBlockingManager()
