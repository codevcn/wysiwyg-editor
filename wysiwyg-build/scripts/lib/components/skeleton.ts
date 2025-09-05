import { html } from "lit-html"
import type { TemplateResult } from "lit-html"

type SkeletonProps = {
  width: number
  height: number
}

export const Skeleton = ({ width, height }: SkeletonProps): TemplateResult<1> => {
  return html`<div
    class="h-${height} w-${width} mb-3 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-[wave_1.5s_linear_infinite]"
  ></div>`
}
