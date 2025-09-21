import type {
  TCheckIfRangeIsInsideWrapper,
  TCleanUpElementsHandler,
  THandleEachRangeHandler,
  TWrapperSelector,
  TWrappingType,
} from "@/types/global-types.js"
import { CodeVCNEditorEngine } from "@/lib/artifact/engine/codevcn-editor.engine.js"

export class TagWrappingEngine {
  constructor() {}

  /**
   * Hàm xử lý xóa styling tag khỏi selection.
   */
  static unwrapRangeContentByTag(
    selectionRange: Range,
    parentElement: HTMLElement,
    contentWrapper?: HTMLElement
  ): void {
    // Tìm thẻ styling tag NHỎ NHẤT bao trọn selection
    const doc = parentElement.ownerDocument
    const tagName = parentElement.tagName // styling tag name

    // Clone nội dung của 3 đoạn: trái | selection | phải (không đụng DOM gốc)
    const clonedRange = selectionRange.cloneRange()

    const leftRange = doc.createRange()
    leftRange.setStart(parentElement, 0)
    leftRange.setEnd(clonedRange.startContainer, clonedRange.startOffset)

    const rightRange = doc.createRange()
    rightRange.setStart(clonedRange.endContainer, clonedRange.endOffset)
    rightRange.setEnd(parentElement, parentElement.childNodes.length)

    const leftFragment = leftRange.cloneContents()
    const midFragment = clonedRange.cloneContents() // phần cần bỏ styling tag
    const rightFragment = rightRange.cloneContents()

    // Xây fragment thay thế, fragment này chứa: <styling tag>left</styling tag> + mid + <styling tag>right</styling tag>
    const replacement = doc.createDocumentFragment()

    if (leftFragment.hasChildNodes()) {
      const leftElement = doc.createElement(tagName)
      leftElement.appendChild(leftFragment)
      replacement.appendChild(leftElement)
    }

    if (midFragment.hasChildNodes()) {
      // KHÔNG bị bọc bởi styling tag
      if (contentWrapper) {
        contentWrapper.appendChild(midFragment)
        replacement.appendChild(contentWrapper)
      } else {
        replacement.appendChild(midFragment)
      }
    }

    if (rightFragment.hasChildNodes()) {
      const rightElement = doc.createElement(tagName)
      rightElement.appendChild(rightFragment)
      replacement.appendChild(rightElement)
    }

    // Thay thẻ cha <styling tag> cũ bằng cấu trúc mới
    parentElement.replaceWith(replacement)
  }

  static wrapRangeContentByTag(range: Range, wrapper: HTMLElement): HTMLElement {
    const content = range.extractContents()
    const clonedWrapper = wrapper.cloneNode() as HTMLElement
    clonedWrapper.appendChild(content)
    range.insertNode(clonedWrapper)
    return clonedWrapper
  }

  static checkIfRangeIsInsideWrapper(selectionRange: Range, wrapperSelector: TWrapperSelector): HTMLElement | null {
    let anchorNode = selectionRange.startContainer
    if (!(anchorNode instanceof HTMLElement)) {
      anchorNode = anchorNode.parentElement!
    }
    return CodeVCNEditorEngine.getClosestParentOfElement(anchorNode as HTMLElement, wrapperSelector)
  }

  static wrapUnwrapRangeByWrapper(
    selectionRange: Range,
    wrapper: HTMLElement,
    wrappingType: TWrappingType,
    checkIfRangeIsInsideWrapper: TCheckIfRangeIsInsideWrapper,
    cleanUpElements: TCleanUpElementsHandler
  ): void {
    if (wrappingType === "unwrap") {
      const parentElement = checkIfRangeIsInsideWrapper(selectionRange)
      if (parentElement) {
        const container = parentElement.parentElement
        if (container && container instanceof HTMLElement) {
          this.unwrapRangeContentByTag(selectionRange, parentElement)
          cleanUpElements(container, wrappingType)
        }
      } else {
        let container = selectionRange.startContainer
        if (!(container instanceof HTMLElement)) {
          container = container.parentElement!
        }
        cleanUpElements(container as HTMLElement, wrappingType, true)
      }
    } else {
      if (checkIfRangeIsInsideWrapper(selectionRange)) return
      const parentElement = this.wrapRangeContentByTag(selectionRange, wrapper)
      cleanUpElements(parentElement, wrappingType)
    }
  }

  static wrapSelectionInMultipleLines(
    selection: Selection,
    tagNamesForWrapping: string[],
    handleEachRange: THandleEachRangeHandler
  ): HTMLElement[] | null {
    if (selection.rangeCount === 0) return null
    const topBlocks = CodeVCNEditorEngine.getSelectedTopBlocksFromRange(selection.getRangeAt(0))
    if (!topBlocks) return null
    if (topBlocks.length > 1) {
      const rootRange = selection.getRangeAt(0)

      const firstTopBlock = topBlocks[0]
      const clonedFirstRange = rootRange.cloneRange()
      const lastTextNode = CodeVCNEditorEngine.getLastTextNodeFromNode(firstTopBlock)
      let wrappingType: TWrappingType = "wrap"
      if (lastTextNode) {
        const startContainer = rootRange.startContainer
        const closestWrapper = this.checkIfRangeIsInsideWrapper(
          clonedFirstRange,
          (element) => tagNamesForWrapping.includes(element.tagName) && element.contains(startContainer)
        )
        if (closestWrapper) {
          wrappingType = "unwrap"
        }
        clonedFirstRange.setEnd(lastTextNode, lastTextNode.nodeValue?.length || 0)
        handleEachRange(clonedFirstRange, wrappingType)
      }

      const lastTopBlock = topBlocks[topBlocks.length - 1]
      const clonedLastRange = rootRange.cloneRange()
      const firstTextNode = CodeVCNEditorEngine.getFirstTextNodeFromNode(lastTopBlock)
      if (firstTextNode) {
        clonedLastRange.setStart(firstTextNode, 0)
        handleEachRange(clonedLastRange, wrappingType)
      }

      const otherTopBlocks = topBlocks.length > 2 ? topBlocks.slice(1, topBlocks.length - 1) : []
      for (const topBlock of otherTopBlocks) {
        const range = document.createRange()
        const firstTextNode = CodeVCNEditorEngine.getFirstTextNodeFromNode(topBlock)
        const lastTextNode = CodeVCNEditorEngine.getLastTextNodeFromNode(topBlock)
        if (firstTextNode && lastTextNode) {
          range.setStart(firstTextNode, 0)
          range.setEnd(lastTextNode, lastTextNode.nodeValue?.length || 0)
          handleEachRange(range, wrappingType)
        }
      }

      return topBlocks
    } else if (topBlocks.length === 1) {
      const rootRange = selection.getRangeAt(0)
      const closestWrapper = this.checkIfRangeIsInsideWrapper(rootRange, (element) =>
        tagNamesForWrapping.includes(element.tagName)
      )
      handleEachRange(rootRange, closestWrapper ? "unwrap" : "wrap")
      return topBlocks
    }
    return null
  }
}
