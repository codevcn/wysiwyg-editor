import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper"
import { editorContent } from "../../content/editor.content"
import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import { EErrorMessage } from "@/enums/global-enums"
import { LitHTMLHelper } from "@/helpers/common-helpers"
import { Skeleton } from "@/lib/components/skeleton"
import type { TImageSkeletonReplacer } from "@/types/global-types"

type TImageProperties = {
  imgUrl: string
  altText: string
  height: number
  width: number
}

class ImageBlockingStylish {
  private imageBlockingTagName: string = "IMG"

  constructor() {}

  private createImageElement({ imgUrl, altText, height, width }: TImageProperties): HTMLImageElement {
    const imageElement = document.createElement(this.imageBlockingTagName) as HTMLImageElement
    imageElement.src = imgUrl
    imageElement.alt = altText
    imageElement.height = height
    imageElement.width = width
    return imageElement
  }

  private insertNewImageElement(
    topBlockElement: HTMLElement,
    { imgUrl, altText, height, width }: TImageProperties
  ): void {
    const imageElement = this.createImageElement({ imgUrl, altText, height, width })
    topBlockElement.replaceChildren(imageElement)
  }

  private makeImageBlocking(
    { imgUrl, altText, height, width }: TImageProperties,
    skeletonReplacer?: TImageSkeletonReplacer
  ): void {
    let selection = editorContent.checkIsFocusingInEditorContent()
    if (!selection) {
      CodeVCNEditorHelper.focusCaretAtEndOfEditorContent()
    }
    selection = editorContent.checkIsFocusingInEditorContent()
    if (!selection) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.SELECTION_NOT_FOUND)
    }
    if (skeletonReplacer) {
      skeletonReplacer(this.createImageElement({ imgUrl, altText, height, width }))
      return
    }
    const { topBlockElement, isEmpty } = CodeVCNEditorHelper.isEmptyTopBlock(selection)
    if (topBlockElement) {
      if (isEmpty) {
        this.insertNewImageElement(topBlockElement, { imgUrl, altText, height, width })
      } else {
        const newBlockElement = CodeVCNEditorHelper.insertNewTopBlockElementAfterElement(selection, topBlockElement)
        this.insertNewImageElement(newBlockElement, { imgUrl, altText, height, width })
      }
    }
  }

  private createImageSkeleton(height: number, width: number): HTMLElement {
    return LitHTMLHelper.createFromRenderer(Skeleton, [{ width, height }])
  }

  private insertImageSkeleton(
    topBlockElement: HTMLElement,
    selection: Selection,
    height: number,
    width: number
  ): HTMLElement {
    const imageSkeleton = this.createImageSkeleton(height, width)
    const pElement = document.createElement("p")
    pElement.innerHTML = "<br>"
    topBlockElement.replaceChildren(pElement, imageSkeleton)
    CodeVCNEditorHelper.moveCaretToStartOfElement(pElement, selection, selection.getRangeAt(0))
    return imageSkeleton
  }

  renderImageSkeleton(height: number, width: number): TImageSkeletonReplacer {
    let selection = editorContent.checkIsFocusingInEditorContent()
    if (!selection) {
      CodeVCNEditorHelper.focusCaretAtEndOfEditorContent()
    }
    selection = editorContent.checkIsFocusingInEditorContent()
    if (!selection) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.SELECTION_NOT_FOUND)
    }
    const { topBlockElement, isEmpty } = CodeVCNEditorHelper.isEmptyTopBlock(selection)
    if (!topBlockElement) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.TOP_BLOCK_NOT_FOUND)
    }
    let imageSkeleton: HTMLElement
    if (isEmpty) {
      imageSkeleton = this.insertImageSkeleton(topBlockElement, selection, height, width)
    } else {
      const newBlockElement = CodeVCNEditorHelper.insertNewTopBlockElementAfterElement(selection, topBlockElement)
      imageSkeleton = this.insertImageSkeleton(newBlockElement, selection, height, width)
    }
    return (imageElement: HTMLImageElement) => {
      imageSkeleton.replaceWith(imageElement)
    }
  }

  onAction({ imgUrl, altText, height, width }: TImageProperties, skeletonReplacer?: TImageSkeletonReplacer) {
    this.makeImageBlocking({ imgUrl, altText, height, width }, skeletonReplacer)
  }
}

export const imageBlockingStylish = new ImageBlockingStylish()
