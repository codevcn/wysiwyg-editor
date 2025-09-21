import { CodeVCNEditorEngine } from "./codevcn-editor.engine"

export class TagWrappingPreparationEngine {
  private static readyEmptyElement: HTMLElement | null = null

  constructor() {}

  static prepareStylingForWrapping(stylingEmptyElement: HTMLElement): void {
    this.readyEmptyElement = stylingEmptyElement.cloneNode() as HTMLElement
  }

  private static wrapNodeByStylingTag(text: string): void {
    const stylingEmptyElement = this.readyEmptyElement!
    const selection = CodeVCNEditorEngine.checkIsFocusingInEditorContent()
    if (!selection || !selection.isCollapsed) return
    const range = selection.getRangeAt(0)
    const node = range.startContainer
    let closestStylingElement = CodeVCNEditorEngine.getClosestParentOfElement(
      node instanceof HTMLElement ? node : node.parentElement!,
      (element) => element.tagName === stylingEmptyElement.tagName
    )
    if (!closestStylingElement) {
      range.insertNode(stylingEmptyElement)
      range.setStart(stylingEmptyElement, 0)
      range.setEnd(stylingEmptyElement, 0)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    const textNode = document.createTextNode(text)
    range.insertNode(textNode)
    range.setStartAfter(textNode)
    range.setEndAfter(textNode)
    selection.removeAllRanges()
    selection.addRange(range)

    this.readyEmptyElement = null
  }

  static completeStylingForWrapping(e: InputEvent): void {
    if (!this.readyEmptyElement) return
    e.preventDefault()
    const data = e.data
    if (!data) return
    this.wrapNodeByStylingTag(data)
  }
}
