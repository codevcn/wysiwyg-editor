import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { render, type TemplateResult } from "lit-html"
import DOMPurify from "dompurify"
import type { TImageDimensions } from "@/types/global-types"
import { EErrorMessage } from "@/enums/global-enums"

export const cn = (...classes: string[]): string => {
  return twMerge(clsx(classes))
}

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html)
}

export class LitHTMLHelper {
  static createFromRenderer<T extends (...args: any[]) => TemplateResult<1>, R extends Element = HTMLElement>(
    Renderer: T,
    data: Parameters<T>
  ): R {
    const container = document.createElement("div")
    render(Renderer(data), container)
    return container.firstElementChild as R
  }
}

/**
 * Kiểm tra string có phải URL hợp lệ không
 * @param {string} str
 * @returns {boolean}
 */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch (_) {
    return false
  }
}

export const getImageDimensions = (file: File): Promise<TImageDimensions> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error(EErrorMessage.ONLY_SUPPORT_IMAGE_FILE))
      return
    }
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
