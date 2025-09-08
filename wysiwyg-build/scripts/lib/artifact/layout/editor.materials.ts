import { ModalManager } from "@/lib/components/managers/modal.manager"
import { PopoverManager } from "@/lib/components/managers/popover.manager"

/**
 * Quản lý khởi tạo các component của editor
 */
class EditorMaterials {
  private modalElement: HTMLElement
  private popoverElement: HTMLElement

  constructor() {
    this.modalElement = ModalManager.initModal()
    this.popoverElement = PopoverManager.initPopover()
  }

  getModalElement(): HTMLElement {
    return this.modalElement
  }

  getPopoverElement(): HTMLElement {
    return this.popoverElement
  }
}

export const editorMaterials = new EditorMaterials()
