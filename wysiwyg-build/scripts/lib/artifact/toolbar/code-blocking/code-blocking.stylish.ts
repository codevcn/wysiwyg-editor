import { ECodeBlockingLanguage, EErrorMessage } from "@/enums/global-enums"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper"
import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import type { TWrappingType } from "@/types/global-types"
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

  private ifTagNameIsCodeBlock(tagName: string): boolean {
    return tagName === this.codeBlockBoxElementTagName
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
    topBlocks: HTMLElement[] | undefined
  ): void {
    if (wrapperAfter) {
      Prism.highlightElement(wrapperAfter)
    }
    if (wrapperBefore) {
      Prism.highlightElement(wrapperBefore)
    }
    if (topBlocks && topBlocks.length > 0) {
      for (const topBlock of topBlocks) {
        Prism.highlightElement(topBlock)
      }
    }
  }

  private cleanUpElements(container: HTMLElement, wrappingType: TWrappingType, isForceToUnwrap?: boolean): void {
    if (wrappingType === "unwrap") {
      if (isForceToUnwrap) {
        CodeVCNEditorHelper.removeOverlapChildTags(container, [this.codeBlockBoxElementTagName], true)
      }
      CodeVCNEditorHelper.removeEmptyChildrenRecursively(container)
      CodeVCNEditorHelper.mergeAdjacentStyling(container)
    } else {
      CodeVCNEditorHelper.removeOverlapChildTags(container, [this.codeBlockBoxElementTagName])
      CodeVCNEditorHelper.removeEmptyChildrenRecursively(container.parentElement || container)
      CodeVCNEditorHelper.mergeAdjacentStyling(container)
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
      const topBlocks = CodeVCNEditorHelper.handleWrappingSelectionInMultipleLines(
        selection,
        [this.codeBlockBoxElementTagName],
        (range, wrappingType) => {
          CodeVCNEditorHelper.wrapUnwrapRangeByWrapper(
            range,
            this.createNewInlineCodeBlockElement(),
            wrappingType,
            (range) =>
              CodeVCNEditorHelper.checkIfRangeIsInsideWrapper(
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
        this.highlightCodeBlockAfterWrapping(
          topBlocks[0],
          topBlocks[topBlocks.length - 1],
          topBlocks.slice(1, topBlocks.length - 1)
        )
      }
      // if (this.checkIfSelectionIsInsideCodeBlock(selection)) {
      //   return
      // } else {
      //   const result = CodeVCNEditorHelper.wrapSelectionInMultipleLinesByWrapper(
      //     selection,
      //     this.createNewInlineCodeBlockElement(ECodeBlockingLanguage.CPP),
      //     (range) => {
      //       return CodeVCNEditorHelper.wrapRangeContentByTag(
      //         range,
      //         this.createNewInlineCodeBlockElement(ECodeBlockingLanguage.CPP)
      //       )
      //     }
      //   )
      //   this.highlightCodeBlockAfterWrapping(result?.wrapperAfter, result?.wrapperBefore, result?.topBlocks)
      // }
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
