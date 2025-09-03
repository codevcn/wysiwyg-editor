type TButtonClickCallback<TAction extends string> = (action: TAction, value?: string) => void

export class ToolbarButton<TAction extends string> {
  element: HTMLElement
  action: TAction
  value?: string

  constructor(el: HTMLElement) {
    this.element = el
    this.action = (el.getAttribute("data-action") as TAction) || ("" as TAction)
    this.value = el.getAttribute("data-value") || undefined
  }

  onClick(callback: TButtonClickCallback<TAction>) {
    this.element.addEventListener("click", () => {
      callback(this.action, this.value)
    })
  }
}
