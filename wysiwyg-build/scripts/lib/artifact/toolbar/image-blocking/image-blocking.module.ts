import { EImageBlockingType, EToolbarAction } from "@/enums/global-enums.js"
import type { TImageBlockingModuleConfig, TToolbarAction } from "@/types/global-types.js"
import { ToolbarButton } from "../toolbar-button.js"
import { html } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"
import { LitHTMLHelper } from "@/helpers/common-helpers.js"
import { addImageModalManager } from "./add-image.manager.js"

class ImageBlockingModule {
  private sectionElement: HTMLElement
  private actions: TToolbarAction[] = [
    {
      action: EToolbarAction.IMAGE_BLOCKING,
      label: `<i class="bi bi-image-fill"></i>`,
    },
  ]

  constructor() {
    this.sectionElement = this.createSectionElement()
    this.bindEvents()
  }

  getSectionElement(): HTMLElement {
    return this.sectionElement
  }

  private createSectionElement(): HTMLElement {
    const Renderer = () =>
      html`<div class="NAME-image-blocking-module flex gap-2">
        ${repeat(
          this.actions,
          ({ action }) => action,
          ({ action, label, className }) =>
            html`<button
              class="NAME-toolbar-btn flex items-center px-2 py-1 leading-none rounded hover:bg-gray-200 cursor-pointer ${className}"
              data-action="${action}"
            >
              ${unsafeHTML(label)}
            </button>`
        )}
      </div>`
    return LitHTMLHelper.createElementFromRenderer(Renderer, [])
  }

  private bindButtonEvents() {
    const buttons = this.sectionElement.querySelectorAll<HTMLElement>(".NAME-toolbar-btn")
    buttons.forEach((btn) => {
      const tb = new ToolbarButton<EImageBlockingType>(btn)
      tb.onClick((action) => {
        this.onAction(action)
      })
    })
  }

  private bindEvents() {
    this.bindButtonEvents()
  }

  configModule(config: TImageBlockingModuleConfig) {
    const { uploadImageURL } = config
    addImageModalManager.setUploadImageURL(uploadImageURL)
  }

  private onAction(action: EImageBlockingType) {
    queueMicrotask(() => {
      switch (action) {
        case EImageBlockingType.IMAGE_BLOCKING:
          addImageModalManager.showAddImageModal()
          break
      }
    })
  }
}

export const imageBlockingModule = new ImageBlockingModule()
