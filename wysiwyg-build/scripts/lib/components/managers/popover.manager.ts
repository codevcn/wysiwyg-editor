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

  static movePopoverToTriggerCenter(trigger: HTMLElement, popover: HTMLElement): void {
    const targetRect = trigger.getBoundingClientRect()
    popover.style.cssText += `
      left: ${targetRect.left + targetRect.width / 2 - popover.offsetWidth / 2}px;
      top: ${targetRect.top + targetRect.height}px;
      padding-top: 5px;
    `
    this.detectCollisionWithViewportEdges(popover)
  }

  static showPopover<TPopover extends typeof Popover>(trigger: HTMLElement, params: Parameters<TPopover>): void {
    const popoverElement = this.popoverElement
    if (!popoverElement) return
    const { content } = params[0]
    const contentElement = popoverElement.querySelector(".NAME-popover-content")
    if (contentElement) {
      contentElement.replaceChildren(LitHTMLHelper.createFromRenderer(() => content, []))
    }
    popoverElement.classList.add("STATE-show")
    this.movePopoverToTriggerCenter(trigger, popoverElement)
  }

  static forceHidePopover(): void {
    this.popoverElement?.classList.remove("STATE-show")
  }

  static hidePopoverOnMouseEvent(trigger: HTMLElement, e: MouseEvent): void {
    const relatedTarget = e.relatedTarget
    if (
      this.popoverElement &&
      relatedTarget &&
      relatedTarget instanceof Node &&
      !trigger.contains(relatedTarget) &&
      !this.popoverElement.contains(relatedTarget)
    ) {
      this.popoverElement.classList.remove("STATE-show")
    }
  }

  static bindHideEventToPopover(): void {
    if (!this.popoverElement) return
    if (this.popoverElement["__hasMouseLeaveEvent_popover"]) return
    this.popoverElement.addEventListener("mouseleave", (e) => {
      if (this.popoverElement) this.hidePopoverOnMouseEvent(this.popoverElement, e)
    })
    this.popoverElement["__hasMouseLeaveEvent_popover"] = true
  }

  static bindHideEventToTrigger(trigger: HTMLElement): void {
    if (trigger["__hasMouseLeaveEvent_popover"]) return
    trigger.addEventListener("mouseleave", (e) => {
      this.hidePopoverOnMouseEvent(trigger, e)
    })
    trigger["__hasMouseLeaveEvent_popover"] = true
  }

  static getPopoverElement(): HTMLElement | null {
    return this.popoverElement
  }

  static initPopover(): HTMLElement {
    const popoverElement = LitHTMLHelper.createFromRenderer<typeof Popover>(Popover, [{ content: html`` }])
    document.body.appendChild(popoverElement)
    this.popoverElement = popoverElement
    return popoverElement
  }
}
