import { html } from "lit-html"
import { ToolbarButton } from "../toolbar-button.js"
import { repeat } from "lit-html/directives/repeat.js"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"
import { CustomDropDown } from "@/lib/components/custom.js"
import { HTMLElementHelper } from "@/utils/helpers.js"
import { textStylingStylish } from "./text-styling-stylish.js"
import { ETextStylingType } from "@/enums/global-enums.js"
import type { TToolbarAction } from "@/types/global-types"

export class TextStylingModule {
  private sectionElement: HTMLElement
  private actions: TToolbarAction[] = [
    {
      command: ETextStylingType.BOLD,
      label: "B",
      type: "button",
      className: "font-bold",
    },
    {
      command: ETextStylingType.ITALIC,
      label: "I",
      type: "button",
      className: "italic font-mono text-lg",
    },
    {
      command: ETextStylingType.UNDERLINE,
      label: "U",
      type: "button",
      className: "underline",
    },
    {
      command: ETextStylingType.STRIKE_THROUGH,
      label: "S",
      type: "button",
      className: "line-through",
    },
  ]

  constructor() {
    this.sectionElement = this.initSectionElement()
    this.bindEvents()
  }

  public getSectionElement(): HTMLElement {
    return this.sectionElement
  }

  private initSectionElement(): HTMLElement {
    const Renderer = () =>
      html`<div class="NAME-text-styling-section p-2 flex gap-2">
        ${repeat(
          this.actions,
          (action) => action.command,
          (action) =>
            action.type === "button"
              ? html`<button
                  class="NAME-toolbar-btn px-2 py-1 leading-none rounded hover:bg-gray-200 cursor-pointer ${action.className}"
                  data-command="${action.command}"
                >
                  ${unsafeHTML(action.label)}
                </button>`
              : CustomDropDown({
                  label: action.label,
                  options: action.options || [],
                  dataObject: {
                    command: action.command,
                  },
                  classNames: {
                    btn: "px-1.5 py-1 leading-none rounded hover:bg-gray-200 cursor-pointer",
                    option: "flex gap-2 py-1 px-2 cursor-pointer hover:bg-gray-200",
                  },
                })
        )}
      </div>`
    return HTMLElementHelper.createFromRenderer(Renderer)
  }

  private bindButtonEvents() {
    const buttons = this.sectionElement.querySelectorAll<HTMLElement>(".NAME-toolbar-btn")
    buttons.forEach((btn) => {
      const tb = new ToolbarButton(btn)
      tb.onClick((cmd) => {
        this.makeStyling(cmd)
      })
    })
  }

  private bindEvents() {
    this.bindButtonEvents()
  }

  public makeStyling(stylingType: ETextStylingType) {
    const selection = window.getSelection()
    if (selection) {
      queueMicrotask(() => {
        textStylingStylish.makeStyling(selection, stylingType)
      })
    }
  }
}

export const textStylingModule = new TextStylingModule()
