import { Modal } from "../modal"
import { LitHTMLHelper } from "@/helpers/common-helpers"
import { html } from "lit-html"

export class ModalManager {
  private static modalElement: HTMLElement | null = null

  static showModal<TModal extends typeof Modal>(params: Parameters<TModal>): void {
    const modalElement = this.modalElement
    if (!modalElement) return
    const { body, title, footer } = params[0]
    modalElement.querySelector(".NAME-modal-body")!.replaceChildren(LitHTMLHelper.createFromRenderer(() => body, []))
    if (title) {
      modalElement.querySelector(".NAME-modal-title")!.textContent = title
    } else {
      modalElement.querySelector(".NAME-modal-title")!.remove()
    }
    if (footer) {
      const modalFooterElement = modalElement.querySelector(".NAME-modal-footer")
      if (modalFooterElement) {
        modalFooterElement.replaceChildren(LitHTMLHelper.createFromRenderer(() => footer, []))
      }
    } else {
      modalElement.querySelector(".NAME-modal-footer")!.remove()
    }
    modalElement.classList.add("STATE-show")
  }

  static hideModal(modalElement: HTMLElement): void {
    modalElement.classList.remove("STATE-show")
  }

  private static bindHideEventHandler(modalElement: HTMLElement): void {
    modalElement.querySelector(".NAME-modal-close")?.addEventListener("click", () => {
      this.hideModal(modalElement)
    })
    modalElement.querySelector(".NAME-modal-overlay")?.addEventListener("click", () => {
      this.hideModal(modalElement)
    })
  }

  static initModal(): HTMLElement {
    const modalElement = LitHTMLHelper.createFromRenderer<typeof Modal>(Modal, [{ body: html`` }])
    document.body.appendChild(modalElement)
    this.bindHideEventHandler(modalElement)
    this.modalElement = modalElement
    return modalElement
  }
}
