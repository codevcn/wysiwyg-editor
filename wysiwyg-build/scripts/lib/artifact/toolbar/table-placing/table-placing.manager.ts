import { getElementIndexInParent, LitHTMLHelper, setupKeyIndexForObjectArray } from "@/helpers/common-helpers"
import { Table } from "@/lib/components/table"
import { html } from "lit-html"
import { ModalManager } from "@/lib/components/managers/modal.manager"
import { tablePlacingStylish } from "./table-placing.stylish"
import { CodeVCNEditorEngine } from "../../engine/codevcn-editor.engine"
import { repeat } from "lit-html/directives/repeat.js"
import { PopoverManager } from "@/lib/components/managers/popover.manager"

type TTablePlacingModalFormData = {
  columns: number
  rows: number
}

class TablePlacingManager {
  private preHighlightedCellElement: HTMLElement | null = null
  private addColumnBtnElement: HTMLElement
  private addRowBtnElement: HTMLElement
  private coordinatesRowOptionsBtn: HTMLElement
  private coordinatesColumnOptionsBtn: HTMLElement

  constructor() {
    this.addColumnBtnElement = this.createAddColumnBtnElement()
    this.addRowBtnElement = this.createAddRowBtnElement()
    this.coordinatesRowOptionsBtn = this.createCoordinatesRowOptionsBtn()
    this.coordinatesColumnOptionsBtn = this.createCoordinatesColumnOptionsBtn()
    document.body.append(
      this.addColumnBtnElement,
      this.addRowBtnElement,
      this.coordinatesRowOptionsBtn,
      this.coordinatesColumnOptionsBtn
    )
  }

  private showCoordinatesOptionsPopover(coordinatesOptionsBtn: HTMLElement, type: "row" | "column"): void {
    const isRow: boolean = type === "row"
    PopoverManager.showPopover(
      coordinatesOptionsBtn,
      [
        {
          content: html`
            <div class="flex flex-col gap-1 text-sm text-gray-800 bg-white py-1 rounded-md">
              <button
                class="flex items-center cursor-pointer gap-1 rounded w-full py-0.5 px-2 hover:bg-red-100 hover:text-red-600"
              >
                <i class="bi bi-trash text-sm"></i>
                <span>Delete ${isRow ? "Row" : "Column"}</span>
              </button>
              <button class="flex items-center cursor-pointer gap-1 rounded w-full py-0.5 px-2 hover:bg-gray-100">
                ${isRow
                  ? html`<i class="bi bi-arrow-90deg-up text-sm"></i>`
                  : html`<i class="bi bi-arrow-90deg-left text-sm"></i>`}
                <span>Insert ${isRow ? "Row" : "Column"} ${isRow ? "Above" : "Left"}</span>
              </button>
              <button class="flex items-center cursor-pointer gap-1 rounded w-full py-0.5 px-2 hover:bg-gray-100">
                ${isRow
                  ? html`<i class="bi bi-arrow-90deg-down text-sm"></i>`
                  : html`<i class="bi bi-arrow-90deg-right text-sm"></i>`}
                <span>Insert ${isRow ? "Row" : "Column"} ${isRow ? "Below" : "Right"}</span>
              </button>
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
          @click=${() => this.showCoordinatesOptionsPopover(this.coordinatesColumnOptionsBtn, "column")}
        >
          <i class="bi bi-three-dots text-sm"></i>
        </button>`,
      []
    )
  }

  private createAddColumnBtnElement(): HTMLElement {
    return LitHTMLHelper.createElementFromRenderer(
      () => html`<div class="NAME-add-table-column-btn-container">
        <button
          class="flex items-center justify-center cursor-pointer bg-white gap-1 p-0.5 rounded w-full border border-regular-table-border-cl hover:bg-gray-100"
        >
          <i class="bi bi-plus-lg text-sm"></i>
        </button>
      </div>`,
      []
    )
  }

  private hideShowAddColumnBtnElement(show: boolean, tableElement: HTMLElement): void {
    this.addColumnBtnElement.classList.toggle("STATE-show", show)
    if (show) {
      const tableElementRect = tableElement.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
      this.addColumnBtnElement.style.cssText = `
        left: ${tableElementRect.right + scrollLeft - 2}px;
        top: ${tableElementRect.top + scrollTop}px;
        height: ${tableElementRect.height}px;
        padding-left: 8px;
      `
    }
  }

  private createNewEmptyColumnElement(rowsCount: number): HTMLElement {
    const cells: Parameters<typeof Table>[0]["rows"][0]["cells"] = []
    for (let i = 0; i < rowsCount; i++) {
      cells.push({
        key: `cell-${i}`,
        content: html`<td>
          <div><br /></div>
        </td>`,
      })
    }
    return LitHTMLHelper.createElementFromRenderer(
      () => html`<tr>
        ${repeat(
          cells,
          ({ key }) => key,
          ({ content }) => content
        )}
      </tr>`,
      []
    )
  }

  private createNewEmptyColumnsElement(columnsCount: number, rowsCount: number): HTMLElement[] {
    const columns: HTMLElement[] = []
    for (let i = 0; i < columnsCount; i++) {
      columns.push(this.createNewEmptyColumnElement(rowsCount))
    }
    return columns
  }

  private insertNewEmptyColumnsElement(columnsCount: number, rowsCount: number, tableElement: HTMLElement): void {
    const columns = this.createNewEmptyColumnsElement(columnsCount, rowsCount)
    tableElement.append(...columns)
    this.hideShowAddColumnBtnElement(true, tableElement)
  }

  private onClickOnAddColumnBtn(tableElement: HTMLElement): void {
    const rowsCount =
      tableElement.querySelectorAll<HTMLElement>(
        `${tablePlacingStylish.getTableBodyTagName()} ${tablePlacingStylish.getTableRowTagName()}`
      ).length || 0
    this.insertNewEmptyColumnsElement(1, rowsCount, tableElement)
  }

  private createAddRowBtnElement(): HTMLElement {
    return LitHTMLHelper.createElementFromRenderer(
      () => html`<div class="NAME-add-table-row-btn-container">
        <button
          class="flex items-center justify-center cursor-pointer bg-white gap-1 p-0.5 rounded w-full border border-regular-table-border-cl hover:bg-gray-100"
        >
          <i class="bi bi-plus-lg text-sm"></i>
        </button>
      </div>`,
      []
    )
  }

  private hideShowAddRowBtnElement(show: boolean, tableElement: HTMLElement): void {
    this.addRowBtnElement.classList.toggle("STATE-show", show)
    if (show) {
      const tableElementRect = tableElement.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
      this.addRowBtnElement.style.cssText = `
        left: ${tableElementRect.left + scrollLeft}px;
        top: ${tableElementRect.bottom + scrollTop - 2}px;
        width: ${tableElementRect.width}px;
        padding-top: 8px;
      `
    }
  }

  private createNewEmptyRowElement(columnsCount: number): HTMLElement {
    const cells: Parameters<typeof Table>[0]["rows"][0]["cells"] = []
    for (let j = 0; j < columnsCount; j++) {
      cells.push({
        key: `cell-${j}`,
        content: html`<td>
          <div><br /></div>
        </td>`,
      })
    }
    return LitHTMLHelper.createElementFromRenderer(
      () => html`<tr>
        ${repeat(
          cells,
          ({ key }) => key,
          ({ content }) => content
        )}
      </tr>`,
      []
    )
  }

  private createNewEmptyRowsElement(rowsCount: number, columnsCountPerRow: number): HTMLElement[] {
    const rows: HTMLElement[] = []
    for (let i = 0; i < rowsCount; i++) {
      rows.push(this.createNewEmptyRowElement(columnsCountPerRow))
    }
    return rows
  }

  private insertNewEmptyRowsElement(rowsCount: number, columnsCountPerRow: number, tableElement: HTMLElement): void {
    const rows = this.createNewEmptyRowsElement(rowsCount, columnsCountPerRow)
    tableElement.append(...rows)
    this.hideShowAddRowBtnElement(true, tableElement)
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

  private onClickOnAddRowBtn(tableElement: HTMLElement): void {
    const lastRow = tableElement.querySelector(tablePlacingStylish.getTableBodyTagName())?.lastElementChild
    const columnsCount = lastRow
      ? lastRow.querySelectorAll<HTMLTableCellElement>(tablePlacingStylish.getTableCellTagName()).length
      : 0
    this.insertNewEmptyRowsElement(1, columnsCount, tableElement)
  }

  private bindHideShowAddRowBtnElement(tableElement: HTMLElement): void {
    tableElement.addEventListener("mouseenter", () => {
      this.hideShowAddRowBtnElement(true, tableElement)
      this.addRowBtnElement.onclick = () => {
        this.onClickOnAddRowBtn(tableElement)
      }
      this.hideShowAddColumnBtnElement(true, tableElement)
      this.addColumnBtnElement.onclick = () => {
        this.onClickOnAddColumnBtn(tableElement)
      }
    })
    tableElement.addEventListener("mouseleave", (e) => {
      const relatedTarget = e.relatedTarget as Node
      if (!(tableElement.contains(relatedTarget) || this.addRowBtnElement.contains(relatedTarget))) {
        this.hideShowAddRowBtnElement(false, tableElement)
      }
      if (!(tableElement.contains(relatedTarget) || this.addColumnBtnElement.contains(relatedTarget))) {
        this.hideShowAddColumnBtnElement(false, tableElement)
      }
    })
    this.addRowBtnElement.addEventListener("mouseleave", (e) => {
      const relatedTarget = e.relatedTarget as Node
      if (tableElement.contains(relatedTarget) || this.addRowBtnElement.contains(relatedTarget)) return
      this.hideShowAddRowBtnElement(false, tableElement)
    })
    this.addColumnBtnElement.addEventListener("mouseleave", (e) => {
      const relatedTarget = e.relatedTarget as Node
      if (tableElement.contains(relatedTarget) || this.addColumnBtnElement.contains(relatedTarget)) return
      this.hideShowAddColumnBtnElement(false, tableElement)
    })
  }

  private insertNewTableIntoCurrentCaret(rowsCount: number, columnsCount: number): void {
    const tableElement = this.createNewTableElement(rowsCount, columnsCount)
    tablePlacingStylish.insertNewTableIntoCurrentCaret(tableElement)
    this.bindHideShowAddRowBtnElement(tableElement)
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

  private showTableCoordinatesOptionsOnSelectionChange(cellElement: HTMLElement | null): void {
    if (cellElement) {
      const tableElement = cellElement.closest<HTMLElement>(tablePlacingStylish.getTableTagName())
      if (!tableElement) return
      const firstRow = tableElement.querySelector(tablePlacingStylish.getTableBodyTagName())?.firstElementChild
      if (!firstRow) return
      const cellsInFirstRow = firstRow.querySelectorAll<HTMLTableCellElement>(tablePlacingStylish.getTableCellTagName())
      const cellIndexInFirstRow = getElementIndexInParent(cellElement)
      const respectiveCellInFirstRow = cellsInFirstRow[cellIndexInFirstRow]
      const currentRow = cellElement.parentElement
      const firstCellInRow = currentRow?.firstElementChild
      if (!firstCellInRow || !respectiveCellInFirstRow) return
      const respectiveCellInFirstRowRect = respectiveCellInFirstRow.getBoundingClientRect()
      const firstCellInRowRect = firstCellInRow.getBoundingClientRect()
      const coordinatesRowOptionsRect = this.coordinatesRowOptionsBtn.getBoundingClientRect()
      const coordinatesColumnOptionsRect = this.coordinatesColumnOptionsBtn.getBoundingClientRect()
      this.coordinatesRowOptionsBtn.classList.add("STATE-show")
      this.coordinatesRowOptionsBtn.style.cssText = `
        left: ${firstCellInRowRect.left - coordinatesRowOptionsRect.width / 2}px;
        top: ${firstCellInRowRect.top + firstCellInRowRect.height / 2 - coordinatesRowOptionsRect.height / 2}px;
      `
      this.coordinatesColumnOptionsBtn.classList.add("STATE-show")
      this.coordinatesColumnOptionsBtn.style.cssText = `
        left: ${
          respectiveCellInFirstRowRect.left +
          respectiveCellInFirstRowRect.width / 2 -
          coordinatesColumnOptionsRect.width / 2
        }px;
        top: ${respectiveCellInFirstRowRect.top - coordinatesColumnOptionsRect.height / 2}px;
      `
    } else {
      this.coordinatesRowOptionsBtn.classList.remove("STATE-show")
      this.coordinatesColumnOptionsBtn.classList.remove("STATE-show")
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
}

export const tablePlacingManager = new TablePlacingManager()
