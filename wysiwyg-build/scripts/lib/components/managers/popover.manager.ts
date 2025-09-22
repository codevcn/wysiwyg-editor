import { LitHTMLHelper, nextFrame } from "@/helpers/common-helpers"
import { html } from "lit-html"
import { Popover } from "../popover"
import { PageLayoutHelper } from "@/helpers/page-layout-helper"

export class PopoverManager {
  private static readonly initialRootPopoverId: string = "initial-root-popover"
  private static readonly popoverElement: HTMLElement = this.initPopover(this.initialRootPopoverId)

  private static moveArrowPosition(triggerRect: DOMRect, popover: HTMLElement): void {
    const arrowElement = popover.querySelector<HTMLElement>(".NAME-popover-arrow")
    if (arrowElement) {
      const triggerRectLeft = triggerRect.left
      const popoverRect = popover.getBoundingClientRect()
      const popoverRectLeft = popoverRect.left
      const popoverRectWidth = popoverRect.width
      let minLeftGap: number = 10
      if (triggerRectLeft > popoverRectLeft) {
        const deltaGap = triggerRectLeft - popoverRectLeft + triggerRect.width / 2
        const maxRightGap = popoverRectWidth - arrowElement.getBoundingClientRect().width - minLeftGap
        if (deltaGap > maxRightGap) {
          minLeftGap = maxRightGap
        } else if (deltaGap > minLeftGap) {
          minLeftGap = deltaGap
        }
      }
      arrowElement.style.cssText += `
        left: ${minLeftGap}px;
      `
    }
  }

  private static movePopoverToTriggerPosition(trigger: HTMLElement, popover: HTMLElement): void {
    const triggerRect = trigger.getBoundingClientRect()
    popover.style.cssText += `
      left: ${triggerRect.left}px;
      top: ${triggerRect.top + triggerRect.height}px;
    `
    const collisionMargin: number = 10
    PageLayoutHelper.detectCollisionWithViewportEdges(popover, collisionMargin)
    this.moveArrowPosition(triggerRect, popover)
  }

  static showPopover<TPopover extends typeof Popover>(
    trigger: HTMLElement,
    params: Parameters<TPopover>,
    popoverId?: string
  ): void {
    const popoverElement = popoverId ? document.getElementById(popoverId) || this.popoverElement : this.popoverElement
    const { content } = params[0]
    const contentElement = popoverElement.querySelector(".NAME-popover-content")
    if (contentElement) {
      contentElement.replaceChildren(LitHTMLHelper.createElementFromRenderer(() => content, []))
    }
    this.movePopoverToTriggerPosition(trigger, popoverElement)
    popoverElement.classList.add("STATE-show")
  }

  static forceHidePopover(popoverId?: string): void {
    const popoverElement = popoverId ? document.getElementById(popoverId) || this.popoverElement : this.popoverElement
    popoverElement.classList.remove("STATE-show")
  }

  private static hidePopoverOnMouseEvent(
    trigger: HTMLElement,
    e: MouseEvent,
    delay?: number,
    popoverId?: string
  ): void {
    const relatedTarget = e.relatedTarget
    const popoverElement = popoverId ? document.getElementById(popoverId) || this.popoverElement : this.popoverElement
    if (
      relatedTarget &&
      relatedTarget instanceof Node &&
      !trigger.contains(relatedTarget) &&
      !popoverElement.contains(relatedTarget)
    ) {
      if (delay && delay > 0) {
        setTimeout(() => {
          popoverElement.classList.remove("STATE-show")
        }, delay)
      } else {
        popoverElement.classList.remove("STATE-show")
      }
    }
  }

  static bindHideEventToPopover(trigger: HTMLElement, delay?: number, popoverId?: string): void {
    this.popoverElement.onmouseleave = (e) => {
      this.hidePopoverOnMouseEvent(trigger, e, delay, popoverId)
    }
  }

  static bindHideEventToTrigger(trigger: HTMLElement, delay?: number, popoverId?: string): void {
    trigger.onmouseleave = (e) => {
      this.hidePopoverOnMouseEvent(trigger, e, delay, popoverId)
    }
  }

  static getPopoverElement(): HTMLElement {
    return this.popoverElement
  }

  private static initPopover(popoverId?: string): HTMLElement {
    const popoverElement = LitHTMLHelper.createElementFromRenderer<typeof Popover>(Popover, [
      { content: html``, id: popoverId || this.initialRootPopoverId },
    ])
    document.body.appendChild(popoverElement)
    return popoverElement
  }
}
