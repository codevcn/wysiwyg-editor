import { Modal } from "../modal"
import { LitHTMLHelper } from "@/helpers/common-helpers"
import { html } from "lit-html"

export class ModalManager {
  static showModal<TModal extends typeof Modal>(params: Parameters<TModal>): void {
    const modalElement = this.getModalElement()
    if (!modalElement) return
    const { bodyLitHTML, title, footerLitHTML } = params[0]
    modalElement.querySelector(".NAME-modal-body")!.appendChild(LitHTMLHelper.createFromRenderer(() => bodyLitHTML, []))
    if (title) {
      modalElement.querySelector(".NAME-modal-title")!.textContent = title
    }
    if (footerLitHTML) {
      const modalFooterElement = modalElement.querySelector(".NAME-modal-footer")
      if (modalFooterElement) {
        modalFooterElement.appendChild(LitHTMLHelper.createFromRenderer(() => footerLitHTML, []))
      }
    }
    modalElement.classList.add("STATE-show")
  }

  static hideModal(modalElement: HTMLElement): void {
    modalElement.classList.remove("STATE-show")
    modalElement.querySelector(".NAME-modal-body")!.innerHTML = ""
    modalElement.querySelector(".NAME-modal-footer")!.innerHTML = ""
  }

  private static bindHideEventHandler(modalElement: HTMLElement): void {
    modalElement.querySelector(".NAME-modal-close")?.addEventListener("click", () => {
      this.hideModal(modalElement)
    })
    modalElement.querySelector(".NAME-modal-overlay")?.addEventListener("click", () => {
      this.hideModal(modalElement)
    })
  }

  static getModalElement(): HTMLElement | null {
    return document.body.querySelector(".NAME-modal")
  }

  static initModal(): HTMLElement {
    let modalElement = document.body.querySelector<HTMLElement>(".NAME-modal")
    if (modalElement) {
      return modalElement
    }
    modalElement = LitHTMLHelper.createFromRenderer(Modal, [{ bodyLitHTML: html`` }])
    document.body.appendChild(modalElement)
    this.bindHideEventHandler(modalElement)
    return modalElement
  }
}
