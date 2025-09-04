import type { EToolbarAction } from "@/enums/global-enums.js"

export type TToolbarButtonType = "button" | "select"

export type TToolbarAction = {
  action: EToolbarAction
  label: HTMLElement["innerHTML"]
  type: TToolbarButtonType
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
