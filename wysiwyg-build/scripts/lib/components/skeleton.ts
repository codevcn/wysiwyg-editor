import { html } from "lit-html"
import type { TemplateResult } from "lit-html"
import { ifDefined } from "lit-html/directives/if-defined.js"

type SkeletonProps = Partial<{
  width: number
  height: number
  fullWidth: boolean
  fullHeight: boolean
}>

export const Skeleton = ({ width, height, fullWidth, fullHeight }: SkeletonProps): TemplateResult<1> => {
  return html`<div
    class="NAME-skeleton ${fullWidth ? "w-full" : ""} ${fullHeight
      ? "h-full"
      : ""} mb-3 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"
    style=${ifDefined(width || height ? `width: ${width || 0}px; height: ${height || 0}px;` : undefined)}
  ></div>`
}
