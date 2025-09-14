import { LitHTMLHelper, nextFrame } from "@/helpers/common-helpers.js"
import { DropdownMenu } from "../dropdown.js"
import { PageLayoutHelper } from "@/helpers/page-layout-helper.js"

type TOnPickOption = (activeValue: string, item: HTMLElement) => void

export class DropdownManager {
  private static readonly dropdownMenuElement: HTMLElement = this.initDropdownMenu()

  private static moveDropdownMenuToTriggerPosition(trigger: HTMLElement): void {
    const triggerRect = trigger.getBoundingClientRect()
    this.dropdownMenuElement.style.cssText = `
      left: ${triggerRect.left}px;
      top: ${triggerRect.top + triggerRect.height - 5}px;
      padding-top: 8px;
    `
  }

  private static showDropdownMenu(trigger: HTMLElement, params: Parameters<typeof DropdownMenu>): void {
    const dropdownMenuElement = this.dropdownMenuElement
    dropdownMenuElement.replaceChildren(
      ...LitHTMLHelper.createElementFromRenderer(DropdownMenu, [{ options: params[0].options }]).children
    )
    this.moveDropdownMenuToTriggerPosition(trigger)
    PageLayoutHelper.detectCollisionWithViewportEdges(dropdownMenuElement)
    nextFrame(() => {
      dropdownMenuElement.classList.add("STATE-show")
      dropdownMenuElement.dataset.showing = "true"
    })
  }

  static hideDropdownMenu(e?: MouseEvent): void {
    if (e && this.dropdownMenuElement.contains(e.target as Node)) return
    this.dropdownMenuElement.classList.remove("STATE-show")
    this.dropdownMenuElement.dataset.showing = "false"
  }

  static onTriggerClick(
    trigger: HTMLElement,
    params: Parameters<typeof DropdownMenu>,
    onPickOption: TOnPickOption
  ): void {
    if (this.dropdownMenuElement.dataset.showing === "true") {
      this.hideDropdownMenu()
    } else {
      this.showDropdownMenu(trigger, params)
      this.bindPickOptionEvent(onPickOption)
    }
  }

  static bindShowDropdownMenuEventToTrigger(
    trigger: HTMLElement,
    params: Parameters<typeof DropdownMenu>,
    onPickOption: TOnPickOption
  ): void {
    trigger.addEventListener("click", () => {
      this.onTriggerClick(trigger, params, onPickOption)
    })
  }

  /**
   * Dropdown component được bind chỉ nên chứa 1 button và 1 content (content gồm các option)
   */
  private static bindPickOptionEvent(onPickOption: TOnPickOption): void {
    this.dropdownMenuElement.onclick = (e) => {
      e.preventDefault()
      let target = e.target as HTMLElement
      while (
        target &&
        !target.classList.contains("NAME-dropdown-option") &&
        this.dropdownMenuElement.contains(target)
      ) {
        target = target.parentElement as HTMLElement
        if (target.tagName === "BODY") break
      }
      if (target && target.classList.contains("NAME-dropdown-option")) {
        const items = this.dropdownMenuElement.querySelectorAll<HTMLElement>(".NAME-dropdown-option")
        for (const item of items) {
          item.classList.remove("active")
        }
        target.classList.add("active")
        onPickOption(target.dataset.value!, target)
        this.hideDropdownMenu()
      }
    }
  }

  private static initDropdownMenu(): HTMLElement {
    const dropdownElement = LitHTMLHelper.createElementFromRenderer(DropdownMenu, [{ options: [] }])
    document.body.appendChild(dropdownElement)
    return dropdownElement
  }
}
