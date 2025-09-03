import type { ETextStylingType, ETextListingType } from "@/enums/global-enums"

export type TToolbarButtonCommand = ETextStylingType | ETextListingType

export type TToolbarAction = {
  command: ETextStylingType | ETextListingType
  label: string
  type: "button" | "select"
} & Partial<{
  options: { value: string; label: string }[]
  className: string
}>
