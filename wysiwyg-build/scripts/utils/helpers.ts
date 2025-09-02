import { render, type TemplateResult } from "lit-html"
import DOMPurify from "dompurify"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export class HTMLElementHelper {
  static createFromRenderer<T extends (...args: any[]) => TemplateResult<1>>(
    Renderer: T,
    ...data: Parameters<T>[]
  ): HTMLElement {
    const container = document.createElement("div")
    render(Renderer(...data), container)
    return container.firstElementChild as HTMLElement
  }

  static sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html)
  }
}

export class UIComponentHelper {
  /**
   * Dropdown component phải chỉ chứa 1 button và 1 content (content gồm các item)
   */
  static bindDropdownEvent(
    dropdownEl: HTMLElement,
    callback: (activeValue: string, item: HTMLElement) => void,
    containerClass: string,
    buttonClass: string,
    itemClass: string
  ): void {
    const hideShowDropdown = () => {
      if (dropdownEl.dataset.open === "true") {
        dropdownEl.dataset.open = "false"
      } else {
        dropdownEl.dataset.open = "true"
      }
    }
    dropdownEl.onclick = (e) => {
      e.preventDefault()
      queueMicrotask(() => {
        let target = e.target as HTMLElement
        if (dropdownEl.querySelector<HTMLElement>(`.${buttonClass}`)!.contains(target)) {
          hideShowDropdown()
        } else {
          while (target && !target.classList.contains(itemClass)) {
            target = target.parentElement as HTMLElement
            if (target.classList.contains(containerClass) || target.tagName === "BODY") break
          }
          if (target && target.classList.contains(itemClass)) {
            hideShowDropdown()
            const items = dropdownEl.querySelectorAll<HTMLElement>(`.${itemClass}`)
            items.forEach((item) => {
              item.classList.remove("active")
            })
            target.classList.add("active")
            callback(target.dataset.value!, target)
          }
        }
      })
    }
  }
}

export const cn = (...classes: string[]): string => {
  return twMerge(clsx(classes))
}

export class LayoutHelper {
  static onClickOnPageBody(fn: (e: MouseEvent) => void): void {
    document.body.addEventListener("click", (e) => {
      queueMicrotask(() => {
        fn(e)
      })
    })
  }
}
