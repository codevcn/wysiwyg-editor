import { ETextStylingType } from "@/enums/global-enums"
import type { TToolbarButtonCommand } from "@/types/global-types"

type TButtonClickCallback = (command: TToolbarButtonCommand, value?: string) => void

export class ToolbarButton {
  element: HTMLElement
  command: TToolbarButtonCommand
  value?: string

  constructor(el: HTMLElement) {
    this.element = el
    this.command = (el.getAttribute("data-command") as TToolbarButtonCommand) || ""
    this.value = el.getAttribute("data-value") || undefined
  }

  onClick(callback: TButtonClickCallback) {
    this.element.addEventListener("click", () => {
      callback(this.command, this.value)
    })
  }
}
