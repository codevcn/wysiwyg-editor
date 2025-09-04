import { EditorErrorHelper } from "@/helpers/error-helper.js"
import { editorContent } from "./content/editor.content.js"
import { editorFrame } from "./frame/editor.frame.js"
import { editorToolbar } from "./toolbar/editor.toolbar.js"
import { ERenderingMode } from "@/enums/global-enums.js"
import { sanitizeHTML } from "@/helpers/common-helpers.js"

class CodeVCNEditor {
  private editorWrapperID: string
  private editorWrapper: HTMLElement

  constructor(editorWrapperID: string, renderingMode: ERenderingMode = ERenderingMode.APPEND) {
    const editorWrapper = document.getElementById(editorWrapperID)
    if (!editorWrapper) {
      throw EditorErrorHelper.createError(`Container with id ${editorWrapperID} not found`)
    }

    this.editorWrapper = editorWrapper
    this.editorWrapperID = editorWrapperID

    editorFrame.getFrameElement().appendChild(editorToolbar.getToolbarElement())
    editorFrame.getFrameElement().appendChild(editorContent.getContentElement())

    if (renderingMode === ERenderingMode.APPEND) {
      this.editorWrapper.appendChild(editorFrame.getFrameElement())
    } else {
      this.editorWrapper.replaceWith(editorFrame.getFrameElement())
    }
  }

  /**
   * Set the HTML content in the editor
   * @param html - The HTML content to set in the editor
   */
  setContent(html: string): void {
    editorContent.getContentElement().innerHTML = sanitizeHTML(html)
  }

  /**
   * Get the HTML content from the editor
   * @returns The HTML content from the editor
   */
  getContent(): string {
    return editorContent.getContentElement().innerHTML
  }

  getEditorWrapperID(): string {
    return this.editorWrapperID
  }

  getEditorWrapperElement(): HTMLElement {
    return this.editorWrapper
  }

  getToolbarElement(): HTMLElement {
    return editorToolbar.getToolbarElement()
  }

  getContentElement(): HTMLElement {
    return editorContent.getContentElement()
  }

  getFrameElement(): HTMLElement {
    return editorFrame.getFrameElement()
  }

  configModule() {}
}

export const codevcnEditor = new CodeVCNEditor("codevcn-editor-root")
