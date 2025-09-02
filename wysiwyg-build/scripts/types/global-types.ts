import type { ETextStylingType } from "@/enums/global-enums"

export type TToolbarButtonCommand = ETextStylingType

export type TToolbarAction = {
  command: ETextStylingType
  label: string
  type: "button" | "select"
} & Partial<{
  options: { value: string; label: string }[]
  className: string
}>
