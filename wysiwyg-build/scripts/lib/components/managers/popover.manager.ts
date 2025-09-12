import { LitHTMLHelper } from "@/helpers/common-helpers"
import { html } from "lit-html"
import { Popover } from "../popover"
import { PageLayoutHelper } from "@/helpers/page-layout-helper"

export class PopoverManager {
  private static popoverElement: HTMLElement | null = null

  private static moveArrowPosition(popover: HTMLElement): void {
    const arrowElement = popover.querySelector<HTMLElement>(".NAME-popover-arrow")
    if (arrowElement) {
      arrowElement.style.cssText += `
        left: 10px;
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
    this.moveArrowPosition(popover)
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

  private static hidePopoverOnMouseEvent(trigger: HTMLElement, e: MouseEvent, delay?: number): void {
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

  static bindHideEventToPopover(trigger: HTMLElement, delay?: number): void {
    if (!this.popoverElement) return
    this.popoverElement.onmouseleave = (e) => {
      this.hidePopoverOnMouseEvent(trigger, e, delay)
    }
  }

  static bindHideEventToTrigger(trigger: HTMLElement, delay?: number): void {
    trigger.onmouseleave = (e) => {
      this.hidePopoverOnMouseEvent(trigger, e, delay)
    }
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
