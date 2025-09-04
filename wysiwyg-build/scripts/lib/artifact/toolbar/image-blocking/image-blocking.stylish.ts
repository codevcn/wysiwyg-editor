import { EImageBlockingType } from "@/enums/global-enums"

class ImageBlockingStylish {
  private imageBlockingTagName: string = "IMAGE"

  constructor() { }
  
  private makeImageBlocking() {
    
  }

  private showAddImageModal() {
    console.log("showAddImageModal")
  }

  onAction(action: EImageBlockingType) {
    console.log(action)
  }
}

export const imageBlockingStylish = new ImageBlockingStylish()
