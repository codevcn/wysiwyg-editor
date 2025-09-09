import { editorContent } from "./content/editor.content.js"
import { editorFrame } from "./frame/editor.frame.js"
import { editorToolbar } from "./toolbar/editor.toolbar.js"
import { ENotifyType, ERenderingMode } from "@/enums/global-enums.js"
import { sanitizeHTML } from "@/helpers/common-helpers.js"
import { TCodeVCNEditorConfig } from "@/types/global-types.js"
import { imageBlockingModule } from "./toolbar/image-blocking/image-blocking.module.js"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper.js"
import { textLinkingManager } from "./toolbar/text-linking/text-linking.manager.js"

class CodeVCNEditor {
  private editorWrapperID: string
  private editorWrapper: HTMLElement

  constructor(editorWrapperID: string, renderingMode: ERenderingMode = ERenderingMode.APPEND) {
    const editorWrapper = document.getElementById(editorWrapperID)
    if (!editorWrapper) {
      const message: string = `Container with id ${editorWrapperID} not found`
      CodeVCNEditorHelper.notify(ENotifyType.ERROR, message)
      throw new Error(message)
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
    this.setupEditorContent()
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

  setupEditorContent(): void {
    textLinkingManager.scanEditorContentForTextLink()
  }

  configModule(configs: TCodeVCNEditorConfig) {
    const { imageModule } = configs
    if (imageModule) {
      imageBlockingModule.configModule(imageModule)
    }
  }
}

export const codevcnEditor = new CodeVCNEditor("codevcn-editor-root")
