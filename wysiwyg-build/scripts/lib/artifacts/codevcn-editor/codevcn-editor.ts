import { editorContent } from "./content/editor-content.js"
import { editorFrame } from "./frame/editor-frame.js"
import { CodeVCNEditorHelper } from "./helpers/codevcn-editor-helper.js"
import { editorToolbar } from "./toolbar/editor-toolbar.js"
import { ERenderingMode } from "@/enums/global-enums.js"

class CodeVCNEditor {
  private editorWrapperID: string
  private editorWrapper: HTMLElement

  constructor(editorWrapperID: string, renderingMode: ERenderingMode = ERenderingMode.APPEND) {
    const editorWrapper = document.getElementById(editorWrapperID)
    if (!editorWrapper) {
      throw new Error(`Container with id ${editorWrapperID} not found`)
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

  getEditorWrapperID(): string {
    return this.editorWrapperID
  }

  getEditorWrapper(): HTMLElement {
    return this.editorWrapper
  }

  getContent(): string {
    return editorContent.getContentElement().innerHTML
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

  setContent(html: string): void {
    editorContent.getContentElement().innerHTML = CodeVCNEditorHelper.sanitizeHTML(html)
  }
}

export const codevcnEditor = new CodeVCNEditor("codevcn-editor-root")
