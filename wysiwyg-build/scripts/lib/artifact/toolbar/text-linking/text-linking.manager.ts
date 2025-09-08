import { html } from "lit-html"
import { editorContent } from "../../content/editor.content"
import { textLinkingStylish } from "./text-linking.stylish"
import { PopoverManager } from "@/lib/components/managers/popover.manager"
import { ModalManager } from "@/lib/components/managers/modal.manager"
import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import { EErrorMessage } from "@/enums/global-enums"
import { editorMaterials } from "../../layout/editor.materials"
import { isValidUrl } from "@/helpers/common-helpers"

type TSaveLinkOnAction = (link: string, textOfLink: string | null) => void

type TTextLinkFormData = {
  link: string
  textOfLink: string | null
}

class TextLinkingManager {
  private linkTyping: string = ""
  private saveLinkOnAction?: TSaveLinkOnAction
  private textLinkForm: HTMLFormElement | null = null
  private debounceTimer: NodeJS.Timeout | undefined = undefined

  constructor() {}

  private copyTextLinkToClipboard(link: string): void {
    navigator.clipboard.writeText(link)
  }

  private unlinkFromText(textLinkElement: HTMLLinkElement): void {
    if (textLinkElement.tagName !== textLinkingStylish.getTextLinkTagName()) return
    const textLinkChildNodes = textLinkElement.childNodes
    textLinkElement.replaceChildren(...textLinkChildNodes)
  }

  private handleLinkTyping(e: InputEvent): void {
    const inputElement = e.currentTarget as HTMLInputElement
    clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(() => {
      this.linkTyping = inputElement.value
      this.textLinkForm?.querySelector(".NAME-text-of-link")?.setAttribute("value", this.linkTyping)
    }, 300)
  }

  private notify(message: string): void {
    console.error(">>> notify:", message)
  }

  private updateLinking(link: string, textLinkElement: HTMLLinkElement): void {
    textLinkElement.setAttribute("href", link)
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

  private saveLinkHandler(e: Event, textLinkElement: HTMLLinkElement | null): void {
    e.preventDefault()
    const formData = this.extractFormData()
    if (!formData) return
    if (textLinkElement) {
      this.updateLinking(formData.link, textLinkElement)
    } else if (this.saveLinkOnAction) {
      this.saveLinkOnAction(formData.link, formData.textOfLink)
    }
  }

  private catchEnterKey(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      this.saveLinkHandler(e, null)
    }
  }

  showEditLinkModal(link: string, textOfLink: string | null, textLinkElement: HTMLLinkElement | null): void {
    ModalManager.showModal([
      {
        title: "Edit link",
        body: html`
          <div class="bg-white px-4 pt-2 pb-4 rounded-lg shadow-lg">
            <form
              class="NAME-text-link-form space-y-4"
              action="#"
              @submit=${(e: Event) => this.saveLinkHandler(e, textLinkElement)}
              @keydown=${(e: KeyboardEvent) => this.catchEnterKey(e)}
            >
              <div>
                <label class="block text-sm font-medium text-black mb-2">Link</label>
                <input
                  type="text"
                  value="${link || this.linkTyping || ""}"
                  class="w-full px-3 py-1 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
                  value="${textOfLink}"
                  name="text-of-link"
                />
              </div>

              <div class="pt-2 flex items-center gap-2">
                ${textLinkElement
                  ? html`
                      <button
                        @click=${() => this.unlinkFromText(textLinkElement)}
                        class="flex items-center justify-center flex-1 gap-2 text-white hover:scale-105 transition duration-200 bg-red-600 rounded-md py-1 px-2 text-sm font-medium cursor-pointer"
                      >
                        <i class="bi bi-trash"></i>
                        <span>Remove link</span>
                      </button>
                    `
                  : ""}
                <button
                  @click=${(e: Event) => this.saveLinkHandler(e, textLinkElement)}
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
  }

  showModalOnAction(textOfLink: string | null, saveLinkOnAction: TSaveLinkOnAction): void {
    this.saveLinkOnAction = saveLinkOnAction
    this.showEditLinkModal("", textOfLink, null)
  }

  scanEditorContentForTextLink(): void {
    const editorContentElement = editorContent.getContentElement()
    const textLinkElements = editorContentElement.querySelectorAll<HTMLLinkElement>(
      textLinkingStylish.getTextLinkTagName()
    )
    for (const textLinkElement of textLinkElements) {
      const link = textLinkElement.getAttribute("href")
      if (link) {
        textLinkElement.addEventListener("mouseover", (e) => {
          console.log(">>> mouse over:")
          const textOfLink = textLinkElement.textContent
          if (textOfLink) {
            PopoverManager.showPopover(textLinkElement, [
              {
                content: html`<div
                  class="flex items-center gap-1 text-gray-800 rounded-lg py-1 px-2 border border-gray-400"
                >
                  <div>
                    <i class="bi bi-globe text-base text-gray-600"></i>
                  </div>
                  <div class="text-gray-600 text-xs truncate max-w-[250px] w-fit">${link}</div>
                  <button
                    class="cursor-pointer p-1 hover:bg-gray-200 rounded-md"
                    @click=${() => this.copyTextLinkToClipboard(link)}
                  >
                    <i class="bi bi-copy text-base"></i>
                  </button>
                  <button
                    class="cursor-pointer p-1 hover:bg-gray-200 rounded-md"
                    @click=${() => this.showEditLinkModal(link, textOfLink, textLinkElement)}
                  >
                    <i class="bi bi-pencil text-base"></i>
                  </button>
                  <button
                    class="cursor-pointer p-1 hover:bg-gray-200 rounded-md"
                    @click=${() => this.unlinkFromText(textLinkElement)}
                  >
                    <i class="bi bi-trash text-base"></i>
                  </button>
                </div>`,
              },
            ])
          }
        })
      }
    }
  }
}

export const textLinkingManager = new TextLinkingManager()
