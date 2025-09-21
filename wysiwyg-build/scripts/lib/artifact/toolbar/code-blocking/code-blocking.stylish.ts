import { ECodeBlockingLanguage, EErrorMessage } from "@/enums/global-enums.js"
import { CodeVCNEditorEngine } from "@/lib/artifact/engine/codevcn-editor.engine.js"
import { EditorInternalErrorHelper } from "@/helpers/error-helper.js"
import type { TWrappingType } from "@/types/global-types.js"
import Prism from "prismjs"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-python"
import { TagWrappingEngine } from "../../engine/wrapping.engine.js"

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
    const topBlockElement = CodeVCNEditorEngine.getTopBlockElementFromElement(codeBlockParent)
    if (!topBlockElement) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.TOP_BLOCK_NOT_FOUND)
    }
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    CodeVCNEditorEngine.moveCaretToPreviousTopBlock(selection)
  }

  jumpToNewLineFromInsideCodeBlock(codeBlockParent: HTMLElement): void {
    const topBlockElement = CodeVCNEditorEngine.getTopBlockElementFromElement(codeBlockParent)
    if (!topBlockElement) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.TOP_BLOCK_NOT_FOUND)
    }
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    CodeVCNEditorEngine.moveCaretToStartOfNextTopBlock(selection)
  }

  private generateInlineCodeBlockClassName(language: ECodeBlockingLanguage): TInlineCodeBlockClassName {
    return `language-${language.toLowerCase()}`
  }

  private createNewInlineCodeBlockElement(language: ECodeBlockingLanguage = ECodeBlockingLanguage.CPP): HTMLElement {
    const inlineCodeBlockElement = document.createElement(this.inlineCodeBlockElementTagName)
    inlineCodeBlockElement.className = this.generateInlineCodeBlockClassName(language)
    return inlineCodeBlockElement
  }

  private ifTagNameIsCodeBlock(tagName: string): boolean {
    return tagName === this.inlineCodeBlockElementTagName
  }

  private highlightCodeBlock(codeblockElement: HTMLElement): void {
    Prism.highlightElement(codeblockElement)
  }

  private highlightCodeBlocksInTopBlocks(topBlocks: HTMLElement[]): void {
    for (const topBlock of topBlocks) {
      for (const inlineCodeBlockElement of topBlock.querySelectorAll<HTMLElement>(this.inlineCodeBlockElementTagName)) {
        this.highlightCodeBlock(inlineCodeBlockElement)
      }
    }
  }

  private cleanUpElements(container: HTMLElement, wrappingType: TWrappingType, isForceToUnwrap?: boolean): void {
    if (wrappingType === "unwrap") {
      if (isForceToUnwrap) {
        CodeVCNEditorEngine.removeOverlapChildTags(container, [this.inlineCodeBlockElementTagName], true)
      }
      CodeVCNEditorEngine.removeEmptyChildrenRecursively(container)
      CodeVCNEditorEngine.mergeAdjacentStyling(container)
    } else {
      CodeVCNEditorEngine.removeOverlapChildTags(container, [this.inlineCodeBlockElementTagName])
      CodeVCNEditorEngine.removeEmptyChildrenRecursively(container.parentElement || container)
      CodeVCNEditorEngine.mergeAdjacentStyling(container)
    }
  }

  insertNewTopBlockForCodeBlock(initCodeBlockHandler: TInitCodeBlockHandler): void {
    let selection = CodeVCNEditorEngine.restoreCaretPosition()
    if (!selection) {
      selection = CodeVCNEditorEngine.focusCaretAtEndOfEditorContent()
    }
    if (!selection) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.SELECTION_NOT_FOUND_AFTER_RESTORE)
    }
    if (CodeVCNEditorEngine.isSelectingContent()) {
      const topBlocks = TagWrappingEngine.wrapSelectionInMultipleLines(
        selection,
        [this.inlineCodeBlockElementTagName],
        (range, wrappingType) => {
          TagWrappingEngine.wrapUnwrapRangeByWrapper(
            range,
            this.createNewInlineCodeBlockElement(),
            wrappingType,
            (range) =>
              TagWrappingEngine.checkIfRangeIsInsideWrapper(
                range,
                (element) =>
                  this.ifTagNameIsCodeBlock(element.tagName) &&
                  element.contains(range.startContainer) &&
                  element.contains(range.endContainer)
              ),
            (container, type, isForceToUnwrap) => {
              this.cleanUpElements(container, type, isForceToUnwrap)
            }
          )
        }
      )
      if (topBlocks) {
        this.highlightCodeBlocksInTopBlocks(topBlocks)
      }
    } else {
      const { topBlockElement, isEmpty } = CodeVCNEditorEngine.isEmptyTopBlock(selection)
      if (topBlockElement) {
        if (!isEmpty) {
          CodeVCNEditorEngine.splitCurrentTopBlockElementAtCaret(selection, true)
        }
        initCodeBlockHandler(selection)
      }
    }
  }
}

export const codeBlockingStylish = new CodeBlockingStylish()
