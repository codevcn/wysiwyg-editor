export class DropdownManager {
  /**
   * Dropdown component được bind chỉ nên chứa 1 button và 1 content (content gồm các option)
   */
  static bindDropdownClickEvent(
    dropdownElement: HTMLElement,
    containerClass: string,
    buttonClass: string,
    optionClass: string,
    onPickOption: (activeValue: string, item: HTMLElement) => void
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
          while (target && !target.classList.contains(optionClass)) {
            target = target.parentElement as HTMLElement
            if (target.classList.contains(containerClass) || target.tagName === "BODY") break
          }
          if (target && target.classList.contains(optionClass)) {
            hideShowDropdown()
            const items = dropdownElement.querySelectorAll<HTMLElement>(`.${optionClass}`)
            items.forEach((item) => {
              item.classList.remove("active")
            })
            target.classList.add("active")
            onPickOption(target.dataset.value!, target)
          }
        }
      })
    }
  }
}
