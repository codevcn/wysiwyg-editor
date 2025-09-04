import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper"
import { editorContent } from "../../content/editor.content"
import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import { EErrorMessage } from "@/enums/global-enums"

type TImageProperties = {
  imgUrl: string
  altText: string
  height: number
  width: number
}

class ImageBlockingStylish {
  private imageBlockingTagName: string = "IMG"

  constructor() {}

  private createImageElement({ imgUrl, altText, height, width }: TImageProperties) {
    const imageElement = document.createElement(this.imageBlockingTagName) as HTMLImageElement
    imageElement.src = imgUrl
    imageElement.alt = altText
    imageElement.height = height
    imageElement.width = width
    return imageElement
  }

  private insertNewImageElement(topBlockElement: HTMLElement, { imgUrl, altText, height, width }: TImageProperties) {
    const imageElement = this.createImageElement({ imgUrl, altText, height, width })
    topBlockElement.replaceChildren(imageElement)
  }

  private makeImageBlocking({ imgUrl, altText, height, width }: TImageProperties) {
    let selection = editorContent.checkIsFocusingInEditorContent()
    if (!selection) {
      CodeVCNEditorHelper.focusCaretAtEndOfEditorContent()
    }
    selection = editorContent.checkIsFocusingInEditorContent()
    if (!selection) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.SELECTION_NOT_FOUND)
    }
    const { topBlockElement, isEmpty } = CodeVCNEditorHelper.isEmptyTopBlock(selection!)
    if (topBlockElement) {
      if (isEmpty) {
        this.insertNewImageElement(topBlockElement, { imgUrl, altText, height, width })
      } else {
        const newBlockElement = CodeVCNEditorHelper.insertNewTopBlockElementAfterElement(topBlockElement)
        if (newBlockElement) {
          this.insertNewImageElement(newBlockElement, { imgUrl, altText, height, width })
        }
      }
    }
  }

  onAction({ imgUrl, altText, height, width }: TImageProperties) {
    console.log(">>> on action:", { imgUrl, altText, height, width })
    this.makeImageBlocking({ imgUrl, altText, height, width })
  }
}

export const imageBlockingStylish = new ImageBlockingStylish()
