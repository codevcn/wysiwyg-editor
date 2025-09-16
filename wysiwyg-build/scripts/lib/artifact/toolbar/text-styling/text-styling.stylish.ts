import { ETextStylingType } from "@/enums/global-enums.js"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper.js"

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
    [ETextStylingType.HEADING_1]: ["H1"],
    [ETextStylingType.HEADING_2]: ["H2"],
    [ETextStylingType.HEADING_3]: ["H3"],
    [ETextStylingType.PARAGRAPH]: ["P"],
  }

  constructor() {}

  getBoldTagNameMostPrioritied(): string {
    return this.tagNamesForStyling[ETextStylingType.BOLD][0]
  }

  private ifTagNameIsCurrentStyling(tagName: string): boolean {
    return this.getCurrentStylingTagNames().includes(tagName)
  }

  private setCurrentStylingType(stylingType: ETextStylingType): void {
    this.currentStylingType = stylingType
  }

  private getCurrentStylingTagNames(): string[] {
    return this.tagNamesForStyling[this.currentStylingType!]
  }

  private getCurrentStylingTagName(): string {
    return this.getCurrentStylingTagNames()[0]
  }

  private ifTagNameIsHeading(tagName: string): boolean {
    return (
      tagName === this.tagNamesForStyling[ETextStylingType.PARAGRAPH][0] ||
      tagName === this.tagNamesForStyling[ETextStylingType.HEADING_1][0] ||
      tagName === this.tagNamesForStyling[ETextStylingType.HEADING_2][0] ||
      tagName === this.tagNamesForStyling[ETextStylingType.HEADING_3][0]
    )
  }

  private ifCurrentStylingTypeIsHeading(): boolean {
    return (
      this.currentStylingType === ETextStylingType.PARAGRAPH ||
      this.currentStylingType === ETextStylingType.HEADING_1 ||
      this.currentStylingType === ETextStylingType.HEADING_2 ||
      this.currentStylingType === ETextStylingType.HEADING_3
    )
  }

  private createNewStylingTagElement(): HTMLElement {
    return document.createElement(this.getCurrentStylingTagName())
  }

  private makeStyling(selection: Selection, stylingType: ETextStylingType): void {
    this.setCurrentStylingType(stylingType)

    CodeVCNEditorHelper.handleWrappingSelectionInMultipleLines(selection, (range) => {
      CodeVCNEditorHelper.wrapUnwrapRangeByWrapper(
        range,
        this.createNewStylingTagElement(),
        (range) =>
          CodeVCNEditorHelper.checkIfRangeIsInsideWrapper(range, (element) => {
            if (this.ifCurrentStylingTypeIsHeading()) {
              return this.ifTagNameIsHeading(element.tagName)
            } else {
              return (
                this.ifTagNameIsCurrentStyling(element.tagName) &&
                element.contains(range.startContainer) &&
                element.contains(range.endContainer)
              )
            }
          }),
        (container, type) => {
          if (type === "unwrap") {
            CodeVCNEditorHelper.removeEmptyChildrenRecursively(container)
            CodeVCNEditorHelper.mergeAdjacentStyling(container)
          } else {
            CodeVCNEditorHelper.removeOverlapChildTags(container, this.getCurrentStylingTagNames())
            CodeVCNEditorHelper.removeEmptyChildrenRecursively(container)
            CodeVCNEditorHelper.mergeAdjacentStyling(container)
          }
        }
      )
    })
  }

  onAction(stylingType: ETextStylingType): void {
    const selection = CodeVCNEditorHelper.checkIsFocusingInEditorContent()
    if (!selection) return
    this.makeStyling(selection, stylingType)
  }
}

export const textStylingStylish = new TextStylingStylish()
