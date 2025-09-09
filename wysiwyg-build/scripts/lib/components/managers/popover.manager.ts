import { LitHTMLHelper } from "@/helpers/common-helpers"
import { html } from "lit-html"
import { Popover } from "../popover"
import { PageLayoutHelper } from "@/helpers/page-layout-helper"

export class PopoverManager {
  private static popoverElement: HTMLElement | null = null

  private static moveArrowPosition(triggerRect: DOMRect, popover: HTMLElement): void {
    const arrowElement = popover.querySelector<HTMLElement>(".NAME-popover-arrow")
    if (arrowElement) {
      arrowElement.style.cssText += `
        left: ${
          triggerRect.width / 2 -
          arrowElement.offsetWidth / 2 +
          (triggerRect.left - popover.getBoundingClientRect().left)
        }px;
      `
    }
  }

  private static movePopoverToTriggerCenter(trigger: HTMLElement, popover: HTMLElement): void {
    const triggerRect = trigger.getBoundingClientRect()
    popover.style.cssText += `
      left: ${triggerRect.left}px;
      top: ${triggerRect.top + triggerRect.height}px;
    `
    PageLayoutHelper.detectCollisionWithViewportEdges(popover, 10)
    this.moveArrowPosition(triggerRect, popover)
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

  static hidePopoverOnMouseEvent(trigger: HTMLElement, e: MouseEvent, delay?: number): void {
    const relatedTarget = e.relatedTarget
    if (
      this.popoverElement &&
      relatedTarget &&
      relatedTarget instanceof Node &&
      !trigger.contains(relatedTarget) &&
      !this.popoverElement.contains(relatedTarget)
    ) {
      if (delay && delay > 0) {
        setTimeout(() => {
          this.popoverElement?.classList.remove("STATE-show")
        }, delay)
      } else {
        this.popoverElement.classList.remove("STATE-show")
      }
    }
  }

  static bindHideEventToPopover(delay?: number): void {
    if (!this.popoverElement) return
    if (this.popoverElement["__hasMouseLeaveEvent_popover"]) return
    this.popoverElement.addEventListener("mouseleave", (e) => {
      if (this.popoverElement) this.hidePopoverOnMouseEvent(this.popoverElement, e, delay)
    })
    this.popoverElement["__hasMouseLeaveEvent_popover"] = true
  }

  static bindHideEventToTrigger(trigger: HTMLElement, delay?: number): void {
    if (trigger["__hasMouseLeaveEvent_popover"]) return
    trigger.addEventListener("mouseleave", (e) => {
      this.hidePopoverOnMouseEvent(trigger, e, delay)
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
