type TDetectCollisionWithViewportEdgesResult = {
  edge: "left" | "right" | "top" | "bottom" | null
}

export class PageLayoutHelper {
  static detectCollisionWithViewportEdges(
    target: HTMLElement,
    margin: number
  ): TDetectCollisionWithViewportEdgesResult {
    const targetRect = target.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const result: TDetectCollisionWithViewportEdgesResult = {
      edge: null,
    }
    if (targetRect.left < 0) {
      target.style.left = `${margin}px`
      result.edge = "left"
    }
    if (targetRect.right > viewportWidth) {
      target.style.left = `${viewportWidth - targetRect.width - margin}px`
      result.edge = "right"
    }
    if (targetRect.top < 0) {
      target.style.top = `${margin}px`
      result.edge = "top"
    }
    if (targetRect.bottom > viewportHeight) {
      target.style.top = `${viewportHeight - targetRect.height - margin}px`
      result.edge = "bottom"
    }
    return result
  }
}
