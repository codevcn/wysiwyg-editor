import { LitHTMLHelper } from "@/helpers/common-helpers"
import { html } from "lit-html"
import { Popover } from "../popover"

export class PopoverManager {
  private static popoverElement: HTMLElement | null = null

  private static detectCollisionWithViewportEdges(popover: HTMLElement): void {
    const margin: number = 10
    const popoverRect = popover.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    if (popoverRect.left < 0) {
      popover.style.left = `${margin}px`
    }
    if (popoverRect.right > viewportWidth) {
      popover.style.left = `${viewportWidth - popover.offsetWidth - margin}px`
    }
    if (popoverRect.top < 0) {
      popover.style.top = `${margin}px`
    }
    if (popoverRect.bottom > viewportHeight) {
      popover.style.top = `${viewportHeight - popover.offsetHeight - margin}px`
    }
  }

  static movePopoverToTargetCenter(target: HTMLElement, popover: HTMLElement): void {
    const targetRect = target.getBoundingClientRect()
    popover.style.left = `${targetRect.left + popover.offsetWidth / 2}px`
    popover.style.top = `${targetRect.top + popover.offsetHeight / 2}px`
    this.detectCollisionWithViewportEdges(popover)
  }

  static showPopover<TPopover extends typeof Popover>(target: HTMLElement, params: Parameters<TPopover>): void {
    const popoverElement = this.popoverElement
    if (!popoverElement) return
    const { content } = params[0]
    const contentElement = popoverElement.querySelector(".NAME-popover-content")
    if (contentElement) {
      contentElement.replaceChildren(LitHTMLHelper.createFromRenderer(() => content, []))
    }
    popoverElement.classList.add("STATE-show")
    this.movePopoverToTargetCenter(target, popoverElement)
  }

  static hidePopover(popoverElement: HTMLElement): void {
    popoverElement.classList.remove("STATE-show")
  }

  static bindHideEventHandler(popoverElement: HTMLElement): void {
    popoverElement.addEventListener("mouseleave", () => {
      this.hidePopover(popoverElement)
    })
  }

  static getPopoverElement(): HTMLElement | null {
    return this.popoverElement
  }

  static initPopover(): HTMLElement {
    const popoverElement = LitHTMLHelper.createFromRenderer<typeof Popover>(Popover, [{ content: html`` }])
    document.body.appendChild(popoverElement)
    this.bindHideEventHandler(popoverElement)
    this.popoverElement = popoverElement
    return popoverElement
  }
}
