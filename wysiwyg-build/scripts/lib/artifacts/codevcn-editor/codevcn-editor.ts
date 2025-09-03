import { HTMLElementHelper } from "@/utils/helpers.js"
import { editorContent } from "./content/editor-content.js"
import { editorFrame } from "./frame/editor-frame.js"
import { editorToolbar } from "./toolbar/editor-toolbar.js"

const CodeVCNEditorID: string = "codevcn-editor-root"

enum ERenderingMode {
  APPEND = "append",
  REPLACE = "replace",
}

class CodeVCNEditor {
  private editorWrapper: HTMLElement

  constructor(editorWrapperId: string, renderingMode: ERenderingMode = ERenderingMode.APPEND) {
    const editorWrapper = document.getElementById(editorWrapperId)
    if (!editorWrapper) {
      throw new Error(`Container with id ${editorWrapperId} not found`)
    }

    this.editorWrapper = editorWrapper

    editorFrame.getFrameElement().appendChild(editorToolbar.getToolbarElement())
    editorFrame.getFrameElement().appendChild(editorContent.getContentElement())

    if (renderingMode === ERenderingMode.APPEND) {
      this.editorWrapper.appendChild(editorFrame.getFrameElement())
    } else {
      this.editorWrapper.replaceWith(editorFrame.getFrameElement())
    }
  }

  getContent(): string {
    return editorContent.getContentElement().innerHTML
  }

  setContent(html: string): void {
    editorContent.getContentElement().innerHTML = HTMLElementHelper.sanitizeHTML(html)
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
}

export const codevcnEditor = new CodeVCNEditor(CodeVCNEditorID)
