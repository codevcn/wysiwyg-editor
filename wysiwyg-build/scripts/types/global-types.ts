import type { EToolbarAction } from "@/enums/global-enums.js"

export type TToolbarAction = {
  action: EToolbarAction
  label: HTMLElement["innerHTML"]
} & Partial<{
  options: ({
    value: string
    label: HTMLElement["innerHTML"]
  } & Partial<{
    className: string
  }>)[]
  className: string
}>

export type TImageBlockingModuleConfig = {
  uploadImageURL: string
}

export type TCodeVCNEditorConfig = Partial<{
  imageModule: TImageBlockingModuleConfig
}>

export type TImageDimensions = {
  width: number
  height: number
}

export type TSkeletonReplacer = (skeletonElement: HTMLElement) => void

export type TImageSkeletonReplacer = (imageElement: HTMLImageElement) => void

export type TWrapSelectionInMultipleLinesByWrapperResult = {
  wrapperAfter: HTMLElement
  wrapperBefore: HTMLElement | null
  topBlocks: HTMLElement[]
}

export type TCheckIfRangeIsInsideWrapper = (selectionRange: Range) => HTMLElement | null

export type TWrapperSelector = (node: HTMLElement) => boolean

export type TCleanUpElementsHandler = (container: HTMLElement, type: "unwrap" | "wrap") => void

export type THandleEachRangeHandler = (range: Range) => void
