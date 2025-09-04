import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { render, type TemplateResult } from "lit-html"
import DOMPurify from "dompurify"

export const cn = (...classes: string[]): string => {
  return twMerge(clsx(classes))
}

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html)
}

export class LitHTMLHelper {
  static createFromRenderer<T extends (...args: any[]) => TemplateResult<1>>(
    Renderer: T,
    data: Parameters<T>
  ): HTMLElement {
    const container = document.createElement("div")
    render(Renderer(data), container)
    return container.firstElementChild as HTMLElement
  }
}
