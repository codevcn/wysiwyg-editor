import { ETextStylingType } from "@/enums/global-enums.js"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper.js"

class TextStylingStylish {
  private currentStylingType: ETextStylingType | null = null
  private parentStylingElement: HTMLElement | null = null
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

  /**
   * Lấy thẻ <styling tag> gần nhất chứa đầy đủ vùng bôi đen (đã check lại rồi, chuẩn rồi).
   */
  private setParentStylingElement(selectionRange: Range): void {
    const startContainer = selectionRange.startContainer
    const node = startContainer.nodeType === Node.TEXT_NODE ? startContainer.parentElement : startContainer
    if (!node || !(node instanceof HTMLElement)) return
    this.parentStylingElement = CodeVCNEditorHelper.getClosestParentOfElement(node, (node) => {
      if (this.ifCurrentStylingTypeIsHeading()) {
        return this.ifTagNameIsHeading(node.tagName)
      } else {
        return (
          this.ifTagNameIsCurrentStyling(node.tagName) &&
          node.contains(selectionRange.startContainer) &&
          node.contains(selectionRange.endContainer)
        )
      }
    })
  }

  private findDescendantsSameTag(parent: HTMLElement): string[] {
    const tagName = parent.tagName
    // liệt kê tất cả các tagName cùng loại với tagName của parent
    const descendantTagNames: string[] = []
    for (const stylingType in this.tagNamesForStyling) {
      const tagNames = this.tagNamesForStyling[stylingType as ETextStylingType]
      if (tagNames.includes(tagName)) {
        descendantTagNames.push(...tagNames)
        break
      }
    }
    return descendantTagNames
  }

  private removeOverlapChildTags(parentStylingElement: HTMLElement): void {
    CodeVCNEditorHelper.removeOverlapChildTags(parentStylingElement, this.findDescendantsSameTag(parentStylingElement))
  }

  private removeEmptyChildrenRecursively(parentStylingElement: HTMLElement): void {
    CodeVCNEditorHelper.removeEmptyChildrenRecursively(parentStylingElement)
  }

  private unstylingFromSelection(selectionRange: Range, parentStylingElement: HTMLElement): void {
    CodeVCNEditorHelper.unstylingFromSelection(selectionRange, parentStylingElement)
  }

  private warpContentByStylingTag(selectionRange: Range, stylingTagName: string): HTMLElement {
    return CodeVCNEditorHelper.warpContentByStylingTag(selectionRange, stylingTagName)
  }

  private mergeAdjacentStyling(parentStylingElement: HTMLElement): void {
    CodeVCNEditorHelper.mergeAdjacentStyling(parentStylingElement)
  }

  private makeStyling(selectionRange: Range, stylingType: ETextStylingType): void {
    this.setCurrentStylingType(stylingType)
    this.setParentStylingElement(selectionRange)

    if (this.parentStylingElement) {
      const topBlockElement = CodeVCNEditorHelper.getTopBlockElementFromElement(this.parentStylingElement)
      // nếu selection nằm hoàn toàn trong 1 styling tag thì xóa styling của selection
      this.unstylingFromSelection(selectionRange, this.parentStylingElement)
      this.mergeAdjacentStyling(this.parentStylingElement)
      if (topBlockElement) {
        this.removeEmptyChildrenRecursively(topBlockElement)
      }
    } else {
      // nếu không nằm hoàn toàn trong styling tag thì bọc content bởi styling tag và xóa các tag giống styling tag
      const parentStylingElement = this.warpContentByStylingTag(selectionRange, this.getCurrentStylingTagName())
      this.removeOverlapChildTags(parentStylingElement)
      this.mergeAdjacentStyling(parentStylingElement)
      const topBlockElement = CodeVCNEditorHelper.getTopBlockElementFromElement(parentStylingElement)
      if (topBlockElement) {
        this.removeEmptyChildrenRecursively(topBlockElement)
      }
    }
  }

  onAction(stylingType: ETextStylingType): void {
    const selection = CodeVCNEditorHelper.checkIsFocusingInEditorContent()
    if (!selection) return
    const range = selection.getRangeAt(0)
    if (range.collapsed) return
    this.makeStyling(range, stylingType)
  }
}

export const textStylingStylish = new TextStylingStylish()
