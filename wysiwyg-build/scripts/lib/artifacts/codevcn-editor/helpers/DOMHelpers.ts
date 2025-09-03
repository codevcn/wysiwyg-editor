import { editorContent } from "../content/editor-content"

export class DOMHelpers {
  static getClosestElementOfNode(startNode: HTMLElement, selector: (node: HTMLElement) => boolean): HTMLElement | null {
    let currentElement: HTMLElement = startNode
    const editorContentElement = editorContent.getContentElement()
    while (currentElement && editorContentElement.contains(currentElement)) {
      if (selector(currentElement)) {
        return currentElement
      }
      currentElement = currentElement.parentNode as HTMLElement
    }
    return null
  }

  static getTopBlockElementFromNode(startNode: HTMLElement): HTMLElement | null {
    let currentElement: HTMLElement = startNode
    let topBlockElement: HTMLElement | null = null
    const editorContentElement = editorContent.getContentElement()
    const editorContentElementName = editorContent.getContentElementName()
    while (currentElement && editorContentElement.contains(currentElement)) {
      currentElement = currentElement.closest("p") as HTMLElement
      if (currentElement.parentElement?.classList.contains(editorContentElementName)) {
        topBlockElement = currentElement
        break
      }
    }
    if (topBlockElement?.tagName !== "P") {
      return null
    }
    return topBlockElement
  }
}
