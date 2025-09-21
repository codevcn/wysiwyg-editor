import { ETextStylingType } from "@/enums/global-enums.js"
import { CodeVCNEditorEngine } from "@/lib/artifact/engine/codevcn-editor.engine.js"
import type { TWrappingType } from "@/types/global-types.js"
import { TagWrappingEngine } from "../../engine/wrapping.engine.js"
import { TagWrappingPreparationEngine } from "../../engine/preparation.engine.js"

class TextStylingStylish {
  private currentStylingType: ETextStylingType | null = null
  /**
   * Tên các thẻ styling cho từng loại styling (index theo thứ tự ưu tiên, 0 là ưu tiên nhất rồi đến 1, 2, 3, ...)
   */
  private readonly tagNamesForStyling: Record<ETextStylingType, string[]> = {
    [ETextStylingType.BOLD]: ["B", "STRONG"],
    [ETextStylingType.ITALIC]: ["I", "EM"],
    [ETextStylingType.UNDERLINE]: ["U", "INS"],
    [ETextStylingType.STRIKE_THROUGH]: ["S", "DEL", "STRIKE"],
  }

  constructor() {}

  getBoldTagNameMostPrioritied(): string {
    return this.tagNamesForStyling[ETextStylingType.BOLD][0]
  }

  private ifTagNameIsCurrentStyling(tagName: string): boolean {
    return this.getCurrentStylingSimilarTagNames().includes(tagName)
  }

  private setCurrentStylingType(stylingType: ETextStylingType): void {
    this.currentStylingType = stylingType
  }

  private getCurrentStylingSimilarTagNames(): string[] {
    return this.tagNamesForStyling[this.currentStylingType!]
  }

  private getCurrentStylingTagName(): string {
    return this.getCurrentStylingSimilarTagNames()[0]
  }

  private createNewStylingTagElement(): HTMLElement {
    return document.createElement(this.getCurrentStylingTagName())
  }

  private cleanUpElements(container: HTMLElement, wrappingType: TWrappingType, isForceToUnwrap?: boolean): void {
    if (wrappingType === "unwrap") {
      if (isForceToUnwrap) {
        CodeVCNEditorEngine.removeOverlapChildTags(container, this.getCurrentStylingSimilarTagNames(), true)
      }
      CodeVCNEditorEngine.removeEmptyChildrenRecursively(container)
      CodeVCNEditorEngine.mergeAdjacentStyling(container)
    } else {
      CodeVCNEditorEngine.removeOverlapChildTags(container, this.getCurrentStylingSimilarTagNames())
      CodeVCNEditorEngine.removeEmptyChildrenRecursively(container.parentElement || container)
      CodeVCNEditorEngine.mergeAdjacentStyling(container)
    }
  }

  private insertStylingAtCaret(): void {
    CodeVCNEditorEngine.saveCurrentCaretPosition()
    TagWrappingPreparationEngine.prepareStylingForWrapping(this.createNewStylingTagElement())
    CodeVCNEditorEngine.restoreCaretPosition()
  }

  private makeStyling(selection: Selection, stylingType: ETextStylingType): void {
    this.setCurrentStylingType(stylingType)

    if (CodeVCNEditorEngine.isSelectingContent()) {
      TagWrappingEngine.wrapSelectionInMultipleLines(
        selection,
        this.getCurrentStylingSimilarTagNames(),
        (range, wrappingType) => {
          TagWrappingEngine.wrapUnwrapRangeByWrapper(
            range,
            this.createNewStylingTagElement(),
            wrappingType,
            (range) =>
              TagWrappingEngine.checkIfRangeIsInsideWrapper(
                range,
                (element) =>
                  this.ifTagNameIsCurrentStyling(element.tagName) &&
                  element.contains(range.startContainer) &&
                  element.contains(range.endContainer)
              ),
            (container, type, isForceToUnwrap) => {
              this.cleanUpElements(container, type, isForceToUnwrap)
            }
          )
        }
      )
    } else {
      this.insertStylingAtCaret()
    }
  }

  onAction(stylingType: ETextStylingType): void {
    const selection = CodeVCNEditorEngine.checkIsFocusingInEditorContent()
    if (!selection) return
    this.makeStyling(selection, stylingType)
  }
}

export const textStylingStylish = new TextStylingStylish()
