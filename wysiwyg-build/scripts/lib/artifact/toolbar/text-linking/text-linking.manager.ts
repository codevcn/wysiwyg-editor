import { html } from "lit-html"
import { editorContent } from "../../content/editor.content"
import { textLinkingStylish } from "./text-linking.stylish"
import { PopoverManager } from "@/lib/components/managers/popover.manager"
import { ModalManager } from "@/lib/components/managers/modal.manager"
import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import { EErrorMessage, EInternalEvents } from "@/enums/global-enums"
import { editorMaterials } from "../../layout/editor.materials"
import { copyTextToClipboard, isValidUrl } from "@/helpers/common-helpers"
import type { TOnSaveLink } from "@/types/api-types"
import { eventEmitter } from "../../event/event-emitter"

type TTextLinkFormData = {
  link: string
  textOfLink: string | null
}

class TextLinkingManager {
  private linkTyping: string = ""
  private onSaveLink?: TOnSaveLink
  private textLinkForm: HTMLFormElement | null = null
  private debounceTimer: NodeJS.Timeout | undefined = undefined
  private currentLink: string | null = null
  private currentTextOfLink: string | null = null
  private currentTextLinkElement: HTMLAnchorElement | null = null

  constructor() {
    eventEmitter.on(EInternalEvents.BIND_TEXT_LINK_POPOVER_EVENT, (textLinkElement) => {
      this.setupTextLinkElementToShowPopover(textLinkElement)
    })
  }

  private copyTextLinkToClipboard(link: string, copyBoxElement: HTMLElement): void {
    copyTextToClipboard(link, copyBoxElement)
  }

  private unlinkFromText(): void {
    if (!this.currentTextLinkElement) return
    const textLinkElement = this.currentTextLinkElement
    if (textLinkElement.tagName !== textLinkingStylish.getTextLinkTagName()) return
    const textLinkChildNodes = textLinkElement.childNodes
    textLinkElement.replaceChildren(...textLinkChildNodes)
  }

  private handleLinkTyping(e: InputEvent): void {
    const inputElement = e.currentTarget as HTMLInputElement
    clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(() => {
      this.linkTyping = inputElement.value
      const textOfLinkInput = this.textLinkForm?.querySelector<HTMLInputElement>(".NAME-text-of-link")
      if (textOfLinkInput && !textOfLinkInput.value) {
        textOfLinkInput.setAttribute("value", this.linkTyping)
      }
    }, 300)
  }

  private notify(message: string): void {
    console.error(">>> notify:", message)
  }

  private validateFormData(form: HTMLFormElement): TTextLinkFormData | null {
    const formData = new FormData(form)
    const link = formData.get("link") as string | null
    const textOfLink = formData.get("text-of-link") as string | null
    if (!link) {
      this.notify("Link and text of link are required")
      return null
    }
    if (!isValidUrl(link)) {
      this.notify("Link is not valid")
      return null
    }
    return { link, textOfLink }
  }

  private extractFormData(): TTextLinkFormData | null {
    if (!this.textLinkForm) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.TEXT_LINK_FORM_NOT_FOUND)
    }
    const formData = this.validateFormData(this.textLinkForm)
    if (!formData) return null
    const { link, textOfLink } = formData
    return { link, textOfLink }
  }

  private saveLinkHandler(e: Event): void {
    e.preventDefault()
    const formData = this.extractFormData()
    if (!formData) return
    if (this.currentTextLinkElement) {
      textLinkingStylish.updateLink(formData.link, formData.textOfLink, this.currentTextLinkElement)
    } else if (this.onSaveLink) {
      this.onSaveLink(formData.link, formData.textOfLink)
    }
  }

  private catchEnterKey(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      this.saveLinkHandler(e)
    }
  }

  showEditLinkModal(): void {
    ModalManager.showModal([
      {
        title: "Edit link",
        body: html`
          <div class="bg-white px-4 pt-2 pb-4 rounded-lg shadow-lg">
            <form
              class="NAME-text-link-form space-y-4"
              action="#"
              @submit=${(e: Event) => this.saveLinkHandler(e)}
              @keydown=${(e: KeyboardEvent) => this.catchEnterKey(e)}
            >
              <div>
                <label class="block text-sm font-medium text-black mb-2">Link</label>
                <input
                  type="text"
                  value="${this.currentLink || this.linkTyping || ""}"
                  class="NAME-link-input w-full px-3 py-1 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter link"
                  @input=${(e: InputEvent) => this.handleLinkTyping(e)}
                  name="link"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-black mb-2">Text of link</label>
                <input
                  type="text"
                  class="NAME-text-of-link w-full px-3 py-1 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter text of link"
                  value="${this.currentTextOfLink}"
                  name="text-of-link"
                />
              </div>

              <div class="pt-2 flex items-center gap-2">
                ${this.currentTextLinkElement
                  ? html`
                      <button
                        @click=${() => this.unlinkFromText()}
                        class="flex items-center justify-center flex-1 gap-2 text-white hover:scale-105 transition duration-200 bg-red-600 rounded-md py-1 px-2 text-sm font-medium cursor-pointer"
                      >
                        <i class="bi bi-trash"></i>
                        <span>Remove link</span>
                      </button>
                    `
                  : ""}
                <button
                  @click=${(e: Event) => this.saveLinkHandler(e)}
                  class="flex items-center justify-center flex-1 gap-2 text-white hover:scale-105 transition duration-200 bg-black rounded-md py-1 px-2 cursor-pointer text-sm font-medium"
                >
                  <i class="bi bi-save"></i>
                  <span>Save link</span>
                </button>
              </div>
            </form>
          </div>
        `,
      },
    ])
    this.textLinkForm = editorMaterials.getModalElement().querySelector(".NAME-text-link-form") as HTMLFormElement
    this.textLinkForm.querySelector<HTMLInputElement>(".NAME-link-input")?.focus()
  }

  showModalOnAction(): void {
    textLinkingStylish.onAction((link, textOfLink, textLinkElement, onSaveLink) => {
      this.currentLink = link
      this.currentTextLinkElement = textLinkElement
      this.currentTextOfLink = textOfLink
      this.onSaveLink = onSaveLink
      this.showEditLinkModal()
    })
  }

  private showModalOnPopover(link: string | null, textLinkElement: HTMLAnchorElement): void {
    this.currentLink = link
    this.currentTextOfLink = textLinkElement.textContent
    this.currentTextLinkElement = textLinkElement
    this.showEditLinkModal()
  }

  private showTextLinkPopover(): void {
    const link = this.currentLink
    const textLinkElement = this.currentTextLinkElement
    if (!link || !textLinkElement) return
    PopoverManager.showPopover(textLinkElement, [
      {
        content: html`<div class="flex items-center gap-1 text-gray-800 rounded-md py-1 px-2">
          <div class="text-gray-600 text-xs truncate max-w-[250px] w-fit">${link}</div>
          <button
            class="NAME-copy-box cursor-pointer p-1 hover:bg-gray-200 rounded-md"
            @click=${(e: MouseEvent) => this.copyTextLinkToClipboard(link, e.currentTarget as HTMLElement)}
          >
            <i class="bi bi-copy text-base NAME-copy-copy"></i>
            <i class="bi bi-check-all text-base NAME-copy-copied"></i>
          </button>
          <button
            class="cursor-pointer p-1 hover:bg-gray-200 rounded-md"
            @click=${() => this.showModalOnPopover(link, textLinkElement)}
          >
            <i class="bi bi-pencil text-base"></i>
          </button>
          <button class="cursor-pointer p-1 hover:bg-gray-200 rounded-md" @click=${() => this.unlinkFromText()}>
            <i class="bi bi-trash text-base"></i>
          </button>
        </div>`,
      },
    ])
    PopoverManager.bindHideEventToTrigger(textLinkElement, 300)
    PopoverManager.bindHideEventToPopover(textLinkElement, 300)
  }

  setupTextLinkElementToShowPopover(textLinkElement: HTMLAnchorElement): void {
    textLinkElement.addEventListener("mouseenter", () => {
      this.currentLink = textLinkElement.getAttribute("href")
      this.currentTextOfLink = textLinkElement.textContent
      this.currentTextLinkElement = textLinkElement
      this.showTextLinkPopover()
    })
  }

  private showPopoverWithLinkInfo(link: string, textLinkElement: HTMLAnchorElement): void {
    this.currentLink = link
    this.currentTextLinkElement = textLinkElement
    this.showTextLinkPopover()
  }

  showModalOnCaretMoves(): void {
    const selection = editorContent.checkIsFocusingInEditorContent()
    if (selection) {
      const node = selection.anchorNode
      const element = node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement)
      if (element?.tagName === textLinkingStylish.getTextLinkTagName()) {
        const link = element.getAttribute("href")
        if (link) {
          this.showPopoverWithLinkInfo(link, element as HTMLAnchorElement)
        }
      } else {
        const linkElement = element?.closest<HTMLAnchorElement>(textLinkingStylish.getTextLinkTagName())
        if (linkElement && editorContent.getContentElement().contains(linkElement)) {
          const link = linkElement.getAttribute("href")
          if (link) {
            this.showPopoverWithLinkInfo(link, linkElement)
          }
        } else {
          PopoverManager.forceHidePopover()
        }
      }
    }
  }

  activateLinksOnEditorContentClick(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === textLinkingStylish.getTextLinkTagName()) {
      const href = target.getAttribute("href")
      if (href) {
        window.open(href, "_blank")
      }
    } else {
      const textLinkElement = target.closest(textLinkingStylish.getTextLinkTagName())
      if (textLinkElement) {
        const href = textLinkElement.getAttribute("href")
        if (href) {
          window.open(href, "_blank")
        }
      }
    }
  }

  scanEditorContentForTextLink(): void {
    const editorContentElement = editorContent.getContentElement()
    const textLinkElements = editorContentElement.querySelectorAll<HTMLAnchorElement>(
      textLinkingStylish.getTextLinkTagName()
    )
    for (const textLinkElement of textLinkElements) {
      const link = textLinkElement.getAttribute("href")
      if (link) {
        this.setupTextLinkElementToShowPopover(textLinkElement)
      }
    }
  }
}

export const textLinkingManager = new TextLinkingManager()
