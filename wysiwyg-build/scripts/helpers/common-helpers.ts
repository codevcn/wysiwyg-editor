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
  static createElementFromRenderer<T extends (...args: any[]) => TemplateResult<1>, R extends Element = HTMLElement>(
    Renderer: T,
    data: Parameters<T>
  ): R {
    const container = document.createElement("div")
    render(Renderer(...data), container)
    return container.firstElementChild as R
  }
}

/**
 * Kiểm tra string có phải URL hợp lệ không, chỉ chấp nhận protocol là https hoặc http
 * @param {string} str
 * @returns {boolean}
 */
export function isValidUrl(str: string): boolean {
  try {
    const urlProtocol = new URL(str).protocol
    if (urlProtocol === "https:" || urlProtocol === "http:") {
      return true
    }
    return false
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

export const copyTextToClipboard = (text: string, copyBoxElement?: HTMLElement): void => {
  navigator.clipboard.writeText(text)
  if (copyBoxElement) {
    copyBoxElement.classList.add("STATE-copied")
    setTimeout(() => {
      copyBoxElement.classList.remove("STATE-copied")
    }, 1500)
  }
}

export const nextFrame = (callback: () => void): void => {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback)
  })
}

/**
 * Chuyển đổi chữ cái đầu tiên thành chữ in hoa, các chữ cái còn lại thành chữ thường
 * @param word string cần chuyển đổi
 * @returns string đã chuyển đổi
 */
export const capitalizeWord = (word: string): string => {
  if (typeof word !== "string" || word.length === 0) return word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

/**
 * Thiết lập key cho mỗi phần tử trong mảng object
 * @param array mảng cần thiết lập key
 * @param prefix tiền tố cho key
 * @returns mảng đã thiết lập key
 */
export const setupKeyIndexForObjectArray = (array: any[], prefix?: string): any[] => {
  let keyIndex: number = 0
  return array.map((item) => ({ ...item, key: `${prefix || "index-prefix"}-${keyIndex++}` }))
}

/**
 * Lấy vị trí của element trong parent bằng cách đếm xem có bao nhiêu anh em đứng trước element đó
 * @param element element cần lấy vị trí
 * @returns vị trí của element trong parent (index bắt đầu từ 0)
 */
export const getElementIndexInParent = (element: HTMLElement): number => {
  let i = 0
  let preSiblingElement = element.previousElementSibling
  while (preSiblingElement) {
    i++
    preSiblingElement = preSiblingElement.previousElementSibling
  }
  return i
}
