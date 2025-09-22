import { getElementIndexInParent, LitHTMLHelper } from "@/helpers/common-helpers"
import { Table } from "@/lib/components/table"
import { html } from "lit-html"
import { ModalManager } from "@/lib/components/managers/modal.manager"
import { tablePlacingStylish } from "./table-placing.stylish"
import { CodeVCNEditorEngine } from "../../engine/codevcn-editor.engine"
import { PopoverManager } from "@/lib/components/managers/popover.manager"
import { TableColumnsRowsManager } from "./table-columns-rows.manager"

type TTablePlacingModalFormData = {
  columns: number
  rows: number
}

class TablePlacingManager {
  private preHighlightedCellElement: HTMLElement | null = null
  private coordinatesRowOptionsBtn: HTMLElement
  private coordinatesColumnOptionsBtn: HTMLElement
  private tableColumnsRowsManager: TableColumnsRowsManager

  constructor() {
    this.coordinatesRowOptionsBtn = this.createCoordinatesRowOptionsBtn()
    this.coordinatesColumnOptionsBtn = this.createCoordinatesColumnOptionsBtn()
    document.body.append(this.coordinatesRowOptionsBtn, this.coordinatesColumnOptionsBtn)
    this.tableColumnsRowsManager = new TableColumnsRowsManager()
  }

  private showCoordinatesOptionsPopover(coordinatesOptionsBtn: HTMLElement, type: "row" | "column"): void {
    const isRow: boolean = type === "row"
    PopoverManager.showPopover(
      coordinatesOptionsBtn,
      [
        {
          content: html`
            <div class="flex flex-col gap-1 text-sm text-gray-800 bg-white py-1 rounded-md">
              ${isRow
                ? html`<button
                    class="flex items-center cursor-pointer gap-1 rounded w-full py-0.5 px-2 hover:bg-red-100 hover:text-red-600"
                    @click=${() => this.tableColumnsRowsManager.deleteRowByCoordinatesOptions()}
                  >
                    <i class="bi bi-trash text-sm"></i>
                    <span>Delete Row</span>
                  </button>`
                : html`<button
                    class="flex items-center cursor-pointer gap-1 rounded w-full py-0.5 px-2 hover:bg-red-100 hover:text-red-600"
                    @click=${() => this.tableColumnsRowsManager.deleteColumnByCoordinatesOptions()}
                  >
                    <i class="bi bi-trash text-sm"></i>
                    <span>Delete Column</span>
                  </button>`}
              ${isRow
                ? html`<button
                    class="flex items-center cursor-pointer gap-1 rounded w-full py-0.5 px-2 hover:bg-gray-100"
                    @click=${() => this.tableColumnsRowsManager.insertNewEmptyRowElementByCoordinatesOptions("above")}
                  >
                    <i class="bi bi-arrow-90deg-up text-sm"></i>
                    <span>Insert Row Above</span>
                  </button>`
                : html`<button
                    class="flex items-center cursor-pointer gap-1 rounded w-full py-0.5 px-2 hover:bg-gray-100"
                    @click=${() =>
                      this.tableColumnsRowsManager.insertNewEmptyColumnsElementByCoordinatesOptions("left")}
                  >
                    <i class="bi bi-arrow-90deg-left text-sm"></i>
                    <span>Insert Column Left</span>
                  </button>`}
              ${isRow
                ? html`<button
                    class="flex items-center cursor-pointer gap-1 rounded w-full py-0.5 px-2 hover:bg-gray-100"
                    @click=${() => this.tableColumnsRowsManager.insertNewEmptyRowElementByCoordinatesOptions("below")}
                  >
                    <i class="bi bi-arrow-90deg-down text-sm"></i>
                    <span>Insert Row Below</span>
                  </button>`
                : html`<button
                    class="flex items-center cursor-pointer gap-1 rounded w-full py-0.5 px-2 hover:bg-gray-100"
                    @click=${() =>
                      this.tableColumnsRowsManager.insertNewEmptyColumnsElementByCoordinatesOptions("right")}
                  >
                    <i class="bi bi-arrow-90deg-right text-sm"></i>
                    <span>Insert Column Right</span>
                  </button>`}
            </div>
          `,
        },
      ],
      "table-coordinates-options-popover"
    )
  }

  private createCoordinatesRowOptionsBtn(): HTMLElement {
    return LitHTMLHelper.createElementFromRenderer(
      () =>
        html`<button
          class="NAME-coordinates-row-options cursor-pointer px-0.5 py-0.5 border border-regular-table-border-cl bg-white hover:bg-gray-100 rounded"
          contenteditable="false"
          @click=${() => this.showCoordinatesOptionsPopover(this.coordinatesRowOptionsBtn, "row")}
        >
          <i class="bi bi-three-dots-vertical text-sm"></i>
        </button>`,
      []
    )
  }

  private createCoordinatesColumnOptionsBtn(): HTMLElement {
    return LitHTMLHelper.createElementFromRenderer(
      () =>
        html`<button
          class="NAME-coordinates-column-options cursor-pointer px-0.5 py-0.5 border border-regular-table-border-cl bg-white hover:bg-gray-100 rounded"
          contenteditable="false"
          @click=${() => this.showCoordinatesOptionsPopover(this.coordinatesColumnOptionsBtn, "column")}
        >
          <i class="bi bi-three-dots text-sm"></i>
        </button>`,
      []
    )
  }

  private createNewTableElement(rowsCount: number, columnsCount: number): HTMLElement {
    const rows: Parameters<typeof Table>[0]["rows"] = []
    for (let i = 0; i < rowsCount; i++) {
      const cells: Parameters<typeof Table>[0]["rows"][0]["cells"] = []
      for (let j = 0; j < columnsCount; j++) {
        cells.push({
          key: `cell-${j}`,
          className: "",
          content: html`<div><br /></div>`,
        })
      }
      rows.push({
        key: `row-${i}`,
        rowClassName: "",
        cells,
      })
    }
    return LitHTMLHelper.createElementFromRenderer(Table, [
      {
        rows,
        isInsideEditorContent: true,
      },
    ])
  }

  private insertNewTableIntoCurrentCaret(rowsCount: number, columnsCount: number): void {
    const tableElement = this.createNewTableElement(rowsCount, columnsCount)
    tablePlacingStylish.insertNewTableIntoCurrentCaret(tableElement)
    this.tableColumnsRowsManager.bindHideShowAddRowBtnElement(tableElement)
  }

  private notify(message: string): void {
    console.error(">>> notify:", message)
  }

  private validateTablePlacingModalForm(form: HTMLFormElement): TTablePlacingModalFormData | null {
    const formData = new FormData(form)
    const columns = parseInt(formData.get("table-columns") as string)
    const rows = parseInt(formData.get("table-rows") as string)
    if (!columns || !rows) {
      this.notify("Số cột và số bàn là bắt buộc")
      return null
    }
    if (columns < 1 || rows < 1) {
      this.notify("Số cột và số bàn phải lớn hơn 0")
      return null
    }
    return { columns, rows }
  }

  private onTablePlacingModalSubmit(e: SubmitEvent): void {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = this.validateTablePlacingModalForm(form)
    if (!formData) return
    const { columns, rows } = formData
    this.insertNewTableIntoCurrentCaret(rows, columns)
    ModalManager.hideModal(ModalManager.getModalElement())
  }

  showTablePlacingModal(): void {
    ModalManager.showModal([
      {
        title: "Add Table",
        body: html`
          <form @submit=${(e: SubmitEvent) => this.onTablePlacingModalSubmit(e)} class="flex flex-col gap-4 p-4">
            <div class="flex flex-col">
              <label for="table-rows" class="mb-1 font-medium">Số bàn</label>
              <input
                id="table-rows-input"
                name="table-rows"
                type="number"
                class="border rounded px-2 py-1"
                placeholder="Nhập số bàn"
                value="1"
              />
            </div>
            <div class="flex flex-col">
              <label for="table-columns" class="mb-1 font-medium">Số cột</label>
              <input
                id="table-columns-input"
                name="table-columns"
                type="number"
                class="border rounded px-2 py-1"
                placeholder="Nhập số cột"
                value="2"
              />
            </div>
            <button
              type="submit"
              class="bg-black cursor-pointer text-white px-4 py-1 rounded-md hover:scale-105 transition"
            >
              Tạo bảng
            </button>
          </form>
        `,
      },
    ])
    ModalManager.getModalElement().querySelector<HTMLInputElement>("#table-rows-input")?.focus()
  }

  private highlightCellFocusedOnSelectionChange(cellElement: HTMLElement | null): void {
    if (cellElement) {
      if (cellElement.isSameNode(this.preHighlightedCellElement)) return
      this.preHighlightedCellElement?.classList.remove("STATE-highlight-cell")
      cellElement.classList.add("STATE-highlight-cell")
      this.preHighlightedCellElement = cellElement
    } else {
      this.preHighlightedCellElement?.classList.remove("STATE-highlight-cell")
      this.preHighlightedCellElement = null
    }
  }

  private getRowFromCellElement(cellElement: HTMLElement): HTMLElement | null {
    return cellElement.closest<HTMLElement>(tablePlacingStylish.getTableRowTagName())
  }

  private showTableCoordinatesOptionsOnSelectionChange(cellElement: HTMLElement | null): void {
    this.tableColumnsRowsManager.setFocusedCellElement(cellElement)
    if (cellElement) {
      const tableElement = cellElement.closest<HTMLElement>(tablePlacingStylish.getTableTagName())
      if (!tableElement) return
      const firstRow = tableElement.querySelector(tablePlacingStylish.getTableBodyTagName())?.firstElementChild
      if (!firstRow) return
      const cellIndexInFirstRow = this.tableColumnsRowsManager.getColumnIndexByCellElement(cellElement)
      const respectiveCellInFirstRow = firstRow.querySelectorAll<HTMLTableCellElement>(
        tablePlacingStylish.getTableCellTagName()
      )[cellIndexInFirstRow]
      const currentRow = this.getRowFromCellElement(cellElement)
      const firstCellInRow = currentRow?.firstElementChild
      if (!firstCellInRow || !respectiveCellInFirstRow) return
      firstCellInRow.appendChild(this.coordinatesRowOptionsBtn)
      respectiveCellInFirstRow.appendChild(this.coordinatesColumnOptionsBtn)
      this.coordinatesRowOptionsBtn.classList.add("STATE-show")
      this.coordinatesColumnOptionsBtn.classList.add("STATE-show")
      this.tableColumnsRowsManager.bindDropAndDragEventsToCoordinatesOptions(
        this.coordinatesRowOptionsBtn,
        this.coordinatesColumnOptionsBtn
      )
    } else {
      this.coordinatesRowOptionsBtn.classList.remove("STATE-show")
      this.coordinatesColumnOptionsBtn.classList.remove("STATE-show")
      document.body.appendChild(this.coordinatesRowOptionsBtn)
      document.body.appendChild(this.coordinatesColumnOptionsBtn)
    }
  }

  private onSelectionChangeOverTableCells(selection: Selection): void {
    const parentOfRange = selection.getRangeAt(0).commonAncestorContainer
    const closestCellElement = CodeVCNEditorEngine.getClosestParentOfElement(
      parentOfRange instanceof HTMLElement ? parentOfRange : parentOfRange.parentElement!,
      (element) => element.tagName === tablePlacingStylish.getTableCellTagName()
    )
    queueMicrotask(() => {
      this.highlightCellFocusedOnSelectionChange(closestCellElement)
    })
    queueMicrotask(() => {
      this.showTableCoordinatesOptionsOnSelectionChange(closestCellElement)
    })
  }

  onEditorContentSelectionChange(selection: Selection): void {
    this.onSelectionChangeOverTableCells(selection)
  }

  private jumpToNextCell(): void {
    const selection = CodeVCNEditorEngine.checkIsFocusingInEditorContent()
    if (!selection) return
    const focusedCellElement = this.tableColumnsRowsManager.getFocusedCellElement()
    if (!focusedCellElement) return
    const currentRow = this.getRowFromCellElement(focusedCellElement)
    if (!currentRow) return
    let nextCell: HTMLElement | null = null
    if (currentRow.lastElementChild?.isSameNode(focusedCellElement)) {
      const nextRow = currentRow.nextElementSibling
      if (!nextRow) return
      nextCell = nextRow.querySelector<HTMLElement>(tablePlacingStylish.getTableCellTagName())
    } else {
      nextCell = focusedCellElement.nextElementSibling as HTMLElement
    }
    if (!nextCell) return
    CodeVCNEditorEngine.moveCaretToElement(nextCell, selection, document.createRange())
  }

  private jumpToCellInRelatedRow(type: "up" | "down"): void {
    const selection = CodeVCNEditorEngine.checkIsFocusingInEditorContent()
    if (!selection) return
    const focusedCellElement = this.tableColumnsRowsManager.getFocusedCellElement()
    if (!focusedCellElement) return
    const currentRow = this.getRowFromCellElement(focusedCellElement)
    if (!currentRow) return
    if (type === "up") {
      const relatedRow = currentRow.previousElementSibling
      if (!relatedRow) return
      const relatedCell = relatedRow.querySelectorAll<HTMLElement>(tablePlacingStylish.getTableCellTagName())[
        getElementIndexInParent(focusedCellElement)
      ]
      if (!relatedCell) return
      CodeVCNEditorEngine.moveCaretToElement(relatedCell, selection, document.createRange())
    } else if (type === "down") {
      const relatedRow = currentRow.nextElementSibling
      if (!relatedRow) return
      const relatedCell = relatedRow.querySelectorAll<HTMLElement>(tablePlacingStylish.getTableCellTagName())[
        getElementIndexInParent(focusedCellElement)
      ]
      if (!relatedCell) return
      CodeVCNEditorEngine.moveCaretToElement(relatedCell, selection, document.createRange())
    }
  }

  onEditorContentKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case "Tab":
        e.preventDefault()
        this.jumpToNextCell()
        break
      case "ArrowDown":
        e.preventDefault()
        this.jumpToCellInRelatedRow("down")
        break
      case "ArrowUp":
        e.preventDefault()
        this.jumpToCellInRelatedRow("up")
        break
    }
    // các key ArrowLeft, ArrowRight đã được hỗ trợ sẵn
  }
}

export const tablePlacingManager = new TablePlacingManager()
