import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export class UIComponentHelper {
  /**
   * Dropdown component phải chỉ chứa 1 button và 1 content (content gồm các item)
   */
  static bindDropdownEvent(
    dropdownElement: HTMLElement,
    containerClass: string,
    buttonClass: string,
    itemClass: string,
    callback: (activeValue: string, item: HTMLElement) => void
  ): void {
    const hideShowDropdown = () => {
      if (dropdownElement.dataset.open === "true") {
        dropdownElement.dataset.open = "false"
      } else {
        dropdownElement.dataset.open = "true"
      }
    }
    dropdownElement.onclick = (e) => {
      e.preventDefault()
      queueMicrotask(() => {
        let target = e.target as HTMLElement
        if (dropdownElement.querySelector<HTMLElement>(`.${buttonClass}`)!.contains(target)) {
          hideShowDropdown()
        } else {
          while (target && !target.classList.contains(itemClass)) {
            target = target.parentElement as HTMLElement
            if (target.classList.contains(containerClass) || target.tagName === "BODY") break
          }
          if (target && target.classList.contains(itemClass)) {
            hideShowDropdown()
            const items = dropdownElement.querySelectorAll<HTMLElement>(`.${itemClass}`)
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
