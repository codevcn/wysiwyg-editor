export class PageLayoutHelper {
  static detectCollisionWithViewportEdges(target: HTMLElement, margin: number): void {
    const popoverRect = target.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    if (popoverRect.left < 0) {
      target.style.left = `${margin}px`
    }
    if (popoverRect.right > viewportWidth) {
      target.style.left = `${viewportWidth - target.offsetWidth - margin}px`
    }
    if (popoverRect.top < 0) {
      target.style.top = `${margin}px`
    }
    if (popoverRect.bottom > viewportHeight) {
      target.style.top = `${viewportHeight - target.offsetHeight - margin}px`
    }
  }
}
