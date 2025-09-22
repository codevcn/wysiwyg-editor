import { getElementIndexInParent, LitHTMLHelper } from "@/helpers/common-helpers.js"
import { Table } from "@/lib/components/table.js"
import { html, type TemplateResult } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"
import { tablePlacingStylish } from "./table-placing.stylish.js"

type TRowHandler = (row: HTMLElement) => void

export class TableColumnsRowsManager {
  private addColumnBtnElement: HTMLElement
  private addRowBtnElement: HTMLElement
  private focusedCellElement: HTMLElement | null = null
  private draggingGhostElement: HTMLElement | null = null
  private draggingRowElement: HTMLElement | null = null
  private draggingColumnIndex: number | null = null

  constructor() {
    this.addColumnBtnElement = this.createAddColumnBtnElement()
    this.addRowBtnElement = this.createAddRowBtnElement()
    document.body.append(this.addColumnBtnElement, this.addRowBtnElement)
  }

  setFocusedCellElement(cellElement: HTMLElement | null): void {
    this.focusedCellElement = cellElement
  }

  getFocusedCellElement(): HTMLElement | null {
    return this.focusedCellElement
  }

  private createNewEmptyCellElement(): TemplateResult<1> {
    return html`<td>
      <div class="relative z-[80]"><br /></div>
    </td>`
  }

  private createAddColumnBtnElement(): HTMLElement {
    return LitHTMLHelper.createElementFromRenderer(
      () => html`<div class="NAME-add-table-column-btn-container">
        <button
          class="flex items-center justify-center cursor-pointer bg-white gap-1 p-0.5 rounded w-full border border-regular-table-border-cl hover:bg-gray-100"
          contenteditable="false"
        >
          <i class="bi bi-plus-lg text-sm"></i>
        </button>
      </div>`,
      []
    )
  }

  private getRowElementByActiveCoordinatesCellElement(): HTMLElement | null {
    return this.focusedCellElement?.closest<HTMLElement>(tablePlacingStylish.getTableRowTagName()) || null
  }

  private getTableElementByActiveCoordinatesCellElement(): HTMLElement | null {
    return this.focusedCellElement?.closest<HTMLElement>(tablePlacingStylish.getTableTagName()) || null
  }

  private hideShowAddColumnBtnElement(show: boolean, tableElement: HTMLElement): void {
    this.addColumnBtnElement.classList.toggle("STATE-show", show)
    if (show) {
      tableElement.appendChild(this.addColumnBtnElement)
    } else {
      document.body.appendChild(this.addColumnBtnElement)
    }
  }

  private getAllRowsFromTableElement(tableElement: HTMLElement): NodeListOf<HTMLElement> {
    return tableElement.querySelectorAll<HTMLElement>(tablePlacingStylish.getTableRowTagName())
  }

  private handleAllTableRows(tableElement: HTMLElement, rowHandler: TRowHandler): void {
    const allRows = this.getAllRowsFromTableElement(tableElement)
    for (const row of allRows) {
      rowHandler(row)
    }
  }

  private insertNewEmptyColumnsElementByIndex(
    columnsCountToAdd: number,
    tableElement: HTMLElement,
    fromIndex?: number
  ): void {
    const cellsElements: HTMLElement[] = []
    for (let i = 0; i < columnsCountToAdd; i++) {
      cellsElements.push(LitHTMLHelper.createElementFromRenderer(() => this.createNewEmptyCellElement(), []))
    }
    this.handleAllTableRows(tableElement, (row) => {
      const clonedCellsElements = cellsElements.map((cellElement) => cellElement.cloneNode(true))
      if (fromIndex || fromIndex === 0) {
        if (fromIndex === 0) {
          row.prepend(...clonedCellsElements)
        } else {
          this.getCellElementByIndex(row, fromIndex).before(...clonedCellsElements)
        }
      } else {
        row.append(...clonedCellsElements)
      }
    })
    this.hideShowAddColumnBtnElement(true, tableElement)
  }

  private onClickOnAddColumnBtn(tableElement: HTMLElement): void {
    this.insertNewEmptyColumnsElementByIndex(1, tableElement)
  }

  private createAddRowBtnElement(): HTMLElement {
    return LitHTMLHelper.createElementFromRenderer(
      () => html`<div class="NAME-add-table-row-btn-container">
        <button
          class="flex items-center justify-center cursor-pointer bg-white gap-1 p-0.5 rounded w-full border border-regular-table-border-cl hover:bg-gray-100"
          contenteditable="false"
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
      tableElement.appendChild(this.addRowBtnElement)
    } else {
      document.body.appendChild(this.addRowBtnElement)
    }
  }

  private createNewEmptyRowElement(columnsCount: number): HTMLElement {
    const cells: Parameters<typeof Table>[0]["rows"][0]["cells"] = []
    for (let j = 0; j < columnsCount; j++) {
      cells.push({
        key: `cell-${j}`,
        content: this.createNewEmptyCellElement(),
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

  private createNewEmptyRowsElement(rowsCountToAdd: number, columnsCountPerRow: number): HTMLElement[] {
    const rows: HTMLElement[] = []
    for (let i = 0; i < rowsCountToAdd; i++) {
      rows.push(this.createNewEmptyRowElement(columnsCountPerRow))
    }
    return rows
  }

  private insertNewEmptyRowsElementByIndex(
    rowsCountToAdd: number,
    columnsCountPerRow: number,
    tableElement: HTMLElement,
    fromIndex?: number
  ): void {
    const rows = this.createNewEmptyRowsElement(rowsCountToAdd, columnsCountPerRow)
    const tableBodyElement = tableElement.querySelector<HTMLElement>(tablePlacingStylish.getTableBodyTagName())
    if (!tableBodyElement) return
    if (fromIndex || fromIndex === 0) {
      if (fromIndex === 0) {
        tableBodyElement.prepend(...rows)
      } else {
        this.getRowElementByIndex(tableElement, fromIndex).before(...rows)
      }
    } else {
      tableBodyElement.append(...rows)
    }
    this.hideShowAddRowBtnElement(true, tableElement)
  }

  private onClickOnAddRowBtn(tableElement: HTMLElement): void {
    this.insertNewEmptyRowsElementByIndex(1, this.calculateTableColumnsCount(tableElement), tableElement)
  }

  private getRowElementByIndex(tableElement: HTMLElement, index: number): HTMLElement {
    return tableElement.querySelectorAll<HTMLElement>(tablePlacingStylish.getTableRowTagName())[index]
  }

  private getCellElementByIndex(rowElement: HTMLElement, index: number): HTMLElement {
    return rowElement.querySelectorAll<HTMLElement>(tablePlacingStylish.getTableCellTagName())[index]
  }

  private calculateTableColumnsCount(tableElement: HTMLElement): number {
    return (
      tableElement
        .querySelector<HTMLElement>(tablePlacingStylish.getTableRowTagName())
        ?.querySelectorAll<HTMLElement>(tablePlacingStylish.getTableCellTagName()).length || 0
    )
  }

  private createDraggingGhostElement(
    mouseX: number,
    mouseY: number,
    rowElement?: HTMLElement,
    columnIndex?: number
  ): HTMLElement | null {
    if (rowElement) {
      const clonedRowElement = rowElement.cloneNode(true) as HTMLElement
      clonedRowElement.style.cssText = `
        position: fixed;
        left: ${mouseX}px;
        top: ${mouseY}px;
        z-index: 999;
        pointer-events: none;
      `
      return clonedRowElement
    } else if (columnIndex) {
    }
    return null
  }

  private setDraggingGhostElement(eX: number, eY: number, rowElement?: HTMLElement, columnIndex?: number): void {
    this.draggingGhostElement = this.createDraggingGhostElement(eX, eY, rowElement, columnIndex)
  }

  getColumnIndexByCellElement(cellElement: HTMLElement): number {
    return getElementIndexInParent(cellElement)
  }

  bindDropAndDragEventsToCoordinatesOptions(
    rowCoordinatesOptionsBtn: HTMLElement,
    columnCoordinatesOptionsBtn: HTMLElement
  ): void {
    const tableElement = this.getTableElementByActiveCoordinatesCellElement()
    if (!tableElement) return
    rowCoordinatesOptionsBtn.onmousedown = (e) => {
      console.log(">>> run this 235")
      const draggingRow = this.getRowElementByActiveCoordinatesCellElement()
      if (!draggingRow) return
      this.draggingRowElement = draggingRow
      draggingRow.classList.add("STATE-dragging")
      this.setDraggingGhostElement(e.clientX, e.clientY, draggingRow)
    }
    tableElement.ondragover = (e) => {
      e.preventDefault()
    }
    tableElement.ondragleave = (e) => {}
    tableElement.ondrop = (e) => {
      const target = e.target as HTMLElement
      console.log(">>> targ:", target)
      const targetRowElement =
        target.nodeName === tablePlacingStylish.getTableRowTagName()
          ? target
          : target.closest<HTMLElement>(tablePlacingStylish.getTableRowTagName())
      if (!targetRowElement || !this.draggingRowElement) return
      tableElement.insertBefore(this.draggingRowElement, targetRowElement)
    }
  }

  bindHideShowAddRowBtnElement(tableElement: HTMLElement): void {
    tableElement.addEventListener("mouseenter", () => {
      this.hideShowAddRowBtnElement(true, tableElement)
      this.addRowBtnElement.querySelector<HTMLElement>("button")!.onclick = () => {
        this.onClickOnAddRowBtn(tableElement)
      }
      this.hideShowAddColumnBtnElement(true, tableElement)
      this.addColumnBtnElement.querySelector<HTMLElement>("button")!.onclick = () => {
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

  insertNewEmptyColumnsElementByCoordinatesOptions(type: "left" | "right"): void {
    const activeCoordinatesCellElement = this.focusedCellElement
    if (!activeCoordinatesCellElement) return
    const tableElement = activeCoordinatesCellElement.closest<HTMLElement>(tablePlacingStylish.getTableTagName())
    if (!tableElement) return
    const cellIndexInRow = this.getColumnIndexByCellElement(activeCoordinatesCellElement)
    if (type === "left") {
      const allRows = this.getAllRowsFromTableElement(tableElement)
      for (const row of allRows) {
        this.getCellElementByIndex(row, cellIndexInRow).before(
          LitHTMLHelper.createElementFromRenderer(() => this.createNewEmptyCellElement(), [])
        )
      }
    } else {
      const allRows = this.getAllRowsFromTableElement(tableElement)
      for (const row of allRows) {
        this.getCellElementByIndex(row, cellIndexInRow).after(
          LitHTMLHelper.createElementFromRenderer(() => this.createNewEmptyCellElement(), [])
        )
      }
    }
  }

  insertNewEmptyRowElementByCoordinatesOptions(type: "above" | "below"): void {
    const activeCoordinatesCellElement = this.focusedCellElement
    if (!activeCoordinatesCellElement) return
    const tableElement = activeCoordinatesCellElement.closest<HTMLElement>(tablePlacingStylish.getTableTagName())
    if (!tableElement) return
    if (type === "above") {
      activeCoordinatesCellElement
        .closest<HTMLElement>(tablePlacingStylish.getTableRowTagName())
        ?.before(this.createNewEmptyRowElement(this.calculateTableColumnsCount(tableElement)))
    } else {
      activeCoordinatesCellElement
        .closest<HTMLElement>(tablePlacingStylish.getTableRowTagName())
        ?.after(this.createNewEmptyRowElement(this.calculateTableColumnsCount(tableElement)))
    }
  }

  deleteRowByCoordinatesOptions(): void {
    const rowElement = this.getRowElementByActiveCoordinatesCellElement()
    if (!rowElement) return
    rowElement.remove()
  }

  deleteColumnByCoordinatesOptions(): void {
    const activeCoordinatesCellElement = this.focusedCellElement
    if (!activeCoordinatesCellElement) return
    const tableElement = this.getTableElementByActiveCoordinatesCellElement()
    if (!tableElement) return
    const columnIndex = this.getColumnIndexByCellElement(activeCoordinatesCellElement)
    if (!columnIndex) return
    this.handleAllTableRows(tableElement, (row) => {
      row.querySelectorAll<HTMLElement>(tablePlacingStylish.getTableCellTagName())[columnIndex].remove()
    })
  }
}
