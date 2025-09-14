import { Modal } from "../modal"
import { LitHTMLHelper } from "@/helpers/common-helpers"
import { html } from "lit-html"

export class ModalManager {
  private static readonly modalElement: HTMLElement = this.initModal()

  static getModalElement(): HTMLElement {
    return this.modalElement
  }

  static showModal<TModal extends typeof Modal>(params: Parameters<TModal>): void {
    const modalElement = this.modalElement
    const { body, title, footer } = params[0]
    modalElement
      .querySelector(".NAME-modal-body")!
      .replaceChildren(LitHTMLHelper.createElementFromRenderer(() => body, []))
    if (title) {
      const titleElement = modalElement.querySelector<HTMLElement>(".NAME-modal-title")!
      titleElement.textContent = title
      titleElement.hidden = false
    } else {
      modalElement.querySelector<HTMLLIElement>(".NAME-modal-title")!.hidden = true
    }
    if (footer) {
      const modalFooterElement = modalElement.querySelector<HTMLElement>(".NAME-modal-footer")!
      modalFooterElement.replaceChildren(LitHTMLHelper.createElementFromRenderer(() => footer, []))
      modalFooterElement.hidden = false
    } else {
      modalElement.querySelector<HTMLLIElement>(".NAME-modal-footer")!.hidden = true
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

  private static initModal(): HTMLElement {
    const modalElement = LitHTMLHelper.createElementFromRenderer<typeof Modal>(Modal, [{ body: html`` }])
    document.body.appendChild(modalElement)
    this.bindHideEventHandler(modalElement)
    return modalElement
  }
}
