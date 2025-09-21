import { ETextHeadingType } from "@/enums/global-enums.js"
import { CodeVCNEditorEngine } from "@/lib/artifact/engine/codevcn-editor.engine.js"
import type { TWrappingType } from "@/types/global-types.js"
import { TagWrappingEngine } from "../../engine/wrapping.engine.js"

class TextHeadingStylish {
  private currentHeadingType: ETextHeadingType | null = null
  /**
   * Tên các thẻ heading cho từng loại heading (index theo thứ tự ưu tiên, 0 là ưu tiên nhất rồi đến 1, 2, 3, ...)
   */
  private readonly tagNamesForHeading: Record<ETextHeadingType, string[]> = {
    [ETextHeadingType.HEADING_1]: ["H1"],
    [ETextHeadingType.HEADING_2]: ["H2"],
    [ETextHeadingType.HEADING_3]: ["H3"],
    [ETextHeadingType.PARAGRAPH]: ["P"],
  }

  constructor() {}

  private setCurrentHeadingType(headingType: ETextHeadingType): void {
    this.currentHeadingType = headingType
  }

  private getCurrentHeadingSimilarTagNames(): string[] {
    return this.tagNamesForHeading[this.currentHeadingType!]
  }

  private getAllHeadingTagNames(): string[] {
    const tagNamesForHeading: string[] = []
    for (const headingKey in this.tagNamesForHeading) {
      tagNamesForHeading.push(...this.tagNamesForHeading[headingKey as ETextHeadingType])
    }
    return tagNamesForHeading
  }

  private getCurrentHeadingTagName(): string {
    return this.getCurrentHeadingSimilarTagNames()[0]
  }

  private ifTagNameIsHeading(tagName: string): boolean {
    const tagNamesForHeading = this.tagNamesForHeading
    for (const headingKey in tagNamesForHeading) {
      if (tagNamesForHeading[headingKey as ETextHeadingType].includes(tagName)) {
        return true
      }
    }
    return false
  }

  private createNewHeadingTagElement(): HTMLElement {
    return document.createElement(this.getCurrentHeadingTagName())
  }

  private cleanUpElements(container: HTMLElement, wrappingType: TWrappingType, isForceToUnwrap?: boolean): void {
    if (wrappingType === "unwrap") {
      if (isForceToUnwrap) {
        CodeVCNEditorEngine.removeOverlapChildTags(container, this.getAllHeadingTagNames())
      }
      CodeVCNEditorEngine.removeEmptyChildrenRecursively(container)
      CodeVCNEditorEngine.mergeAdjacentStyling(container)
    } else {
      CodeVCNEditorEngine.removeOverlapChildTags(container, this.getAllHeadingTagNames())
      CodeVCNEditorEngine.removeEmptyChildrenRecursively(container.parentElement || container)
      CodeVCNEditorEngine.mergeAdjacentStyling(container)
    }
  }

  private makeHeading(selection: Selection, headingType: ETextHeadingType): void {
    this.setCurrentHeadingType(headingType)

    TagWrappingEngine.wrapSelectionInMultipleLines(selection, this.getAllHeadingTagNames(), (range, wrappingType) => {
      // CodeVCNEditorEngine.wrapUnwrapRangeByWrapper(
      //   range,
      //   this.createNewHeadingTagElement(),
      //   wrappingType,
      //   (range) =>
      //     CodeVCNEditorEngine.checkIfRangeIsInsideWrapper(
      //       range,
      //       (element) =>
      //         this.ifTagNameIsHeading(element.tagName) &&
      //         element.contains(range.startContainer) &&
      //         element.contains(range.endContainer)
      //     ),
      //   (container, type) => {
      //     if (type === "unwrap") {
      //       CodeVCNEditorEngine.removeEmptyChildrenRecursively(container)
      //       CodeVCNEditorEngine.mergeAdjacentStyling(container)
      //     } else {
      //       CodeVCNEditorEngine.removeOverlapChildTags(container, this.getAllHeadingTagNames())
      //       CodeVCNEditorEngine.removeEmptyChildrenRecursively(container.parentElement || container)
      //       CodeVCNEditorEngine.mergeAdjacentStyling(container)
      //     }
      //   }
      // )
      const checkIfRangeIsInsideWrapper = (selectionRange: Range) =>
        TagWrappingEngine.checkIfRangeIsInsideWrapper(
          selectionRange,
          (element) =>
            this.ifTagNameIsHeading(element.tagName) &&
            element.contains(selectionRange.startContainer) &&
            element.contains(selectionRange.endContainer)
        )
      const wrapper = this.createNewHeadingTagElement()
      if (wrappingType === "unwrap") {
        const parentElement = checkIfRangeIsInsideWrapper(range)
        if (parentElement) {
          if (parentElement.tagName === wrapper.tagName) return
          const container = parentElement.parentElement
          if (container && container instanceof HTMLElement) {
            TagWrappingEngine.unwrapRangeContentByTag(range, parentElement, wrapper)
            this.cleanUpElements(container, wrappingType)
          }
        } else {
          this.cleanUpElements(wrapper, wrappingType, true)
        }
      } else {
        if (checkIfRangeIsInsideWrapper(range)) return
        const parentElement = TagWrappingEngine.wrapRangeContentByTag(range, wrapper)
        this.cleanUpElements(parentElement, wrappingType)
      }
    })
  }

  onAction(headingType: ETextHeadingType): void {
    const selection = CodeVCNEditorEngine.checkIsFocusingInEditorContent()
    if (!selection) return
    this.makeHeading(selection, headingType)
  }
}

export const textHeadingStylish = new TextHeadingStylish()
