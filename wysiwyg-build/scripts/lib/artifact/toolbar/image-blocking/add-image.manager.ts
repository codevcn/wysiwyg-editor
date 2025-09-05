import { EErrorMessage, ENotifyType } from "@/enums/global-enums"
import { getImageDimensions, isValidUrl } from "@/helpers/common-helpers"
import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import { ModalManager } from "@/lib/components/managers/modal.manager"
import { Modal } from "@/lib/components/modal"
import { CodeVCNEditorService } from "@/services/codevcn-editor.service"
import { html } from "lit-html"
import { imageBlockingStylish } from "./image-blocking.stylish"
import type { TImageDimensions, TImageSkeletonReplacer } from "@/types/global-types"

type TMemorizedImage = {
  imgUrl: string
  dimensions: TImageDimensions
  caption: string
}

class AddImageModalManager {
  private addImageModal: HTMLElement
  private uploadImageURL: string
  private maxImageSizeAllowed: number
  private maxImagesCountAllowed: number
  private memorizedImage: TMemorizedImage | null = null

  constructor() {
    this.addImageModal = this.createAddImageModal()
    this.uploadImageURL = ""
    this.maxImageSizeAllowed = 10 * 1024 * 1024 // 10MB
    this.maxImagesCountAllowed = 5
  }

  setUploadImageURL(url: string) {
    if (!isValidUrl(url)) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.INVALID_UPLOAD_IMAGE_URL)
    }
    this.uploadImageURL = url
  }

  getAddImageModal(): HTMLElement {
    return this.addImageModal
  }

  getUploadImageURL(): string {
    return this.uploadImageURL
  }

  private createAddImageModal(): HTMLElement {
    return ModalManager.initModal()
  }

  private switchAddImageType(e: PointerEvent) {
    e.preventDefault()
    const currentTarget = e.currentTarget as HTMLElement
    const currentBtn = currentTarget.classList.contains("NAME-add-image-btn-upload") ? "upload" : "url"
    const addImageContent = this.addImageModal.querySelector(".NAME-add-image-content") as HTMLElement
    const addImageTypeButtons = this.addImageModal.querySelector(".NAME-add-image-type-buttons") as HTMLElement
    addImageContent.classList.remove("STATE-upload", "STATE-url")
    addImageTypeButtons.classList.remove("STATE-upload", "STATE-url")
    if (currentBtn === "upload") {
      addImageContent.classList.add("STATE-upload")
      addImageTypeButtons.classList.add("STATE-upload")
    } else {
      addImageContent.classList.add("STATE-url")
      addImageTypeButtons.classList.add("STATE-url")
    }
  }

  private pickImageFile(e: PointerEvent) {
    e.preventDefault()
    e.stopPropagation()
    const input = this.addImageModal.querySelector(".NAME-add-image-upload-input") as HTMLInputElement
    input.click()
  }

  private notify(type: ENotifyType, message: string) {
    console.error(">>> notify:", { message, type })
  }

  private validateImageFile(file: File): boolean {
    if (file.size > this.maxImageSizeAllowed) {
      this.notify(ENotifyType.ERROR, EErrorMessage.IMAGE_SIZE_TOO_LARGE)
      return false
    }
    if (
      file.type !== "image/svg+xml" &&
      file.type !== "image/png" &&
      file.type !== "image/jpg" &&
      file.type !== "image/jpeg" &&
      file.type !== "image/gif"
    ) {
      this.notify(ENotifyType.ERROR, EErrorMessage.INVALID_IMAGE_TYPE)
      return false
    }
    return true
  }

  private validateImageFiles(files: File[]): boolean {
    if (files.length > this.maxImagesCountAllowed) {
      this.notify(ENotifyType.ERROR, EErrorMessage.MAX_IMAGES_COUNT_TOO_LARGE)
      return false
    }
    for (const file of files) {
      if (!this.validateImageFile(file)) {
        return false
      }
    }
    return true
  }

  private previewImage(imgAltText: string, url: string) {
    const preview = this.addImageModal.querySelector(".NAME-add-image-preview") as HTMLElement
    const image = new Image()
    image.src = url
    image.alt = imgAltText
    image.className = "w-full h-full object-contain"
    image.onload = () => {
      preview.innerHTML = ""
      preview.appendChild(image)
    }
    const imgUrlInputHidden = this.addImageModal.querySelector(".NAME-add-image-img-url") as HTMLInputElement
    imgUrlInputHidden.value = url
    const imgUrlInput = this.addImageModal.querySelector(".NAME-add-image-url-input") as HTMLInputElement
    imgUrlInput.value = url
  }

  private checkIfImageFile(file: File): boolean {
    return file.type.startsWith("image/")
  }

  private memorizeImageData(imgUrl: string, dimensions: TImageDimensions, caption: string) {
    this.memorizedImage = { imgUrl, dimensions, caption }
  }

  private renderImageSkeleton(height: number, width: number): TImageSkeletonReplacer {
    return imageBlockingStylish.renderImageSkeleton(height, width)
  }

  private async uploadImageFile(file: File) {
    return await CodeVCNEditorService.uploadImage(this.uploadImageURL, [file], (progress) => {
      console.log(">>> progress:", progress)
    })
  }

  async onPasteImage(e: ClipboardEvent) {
    const clipboardData = e.clipboardData
    if (clipboardData) {
      const files = clipboardData.files
      if (files && files.length > 0) {
        const fileToUpload = files[0]
        if (!this.checkIfImageFile(fileToUpload)) {
          this.notify(ENotifyType.ERROR, EErrorMessage.ONLY_SUPPORT_IMAGE_FILE)
          return
        }
        e.preventDefault()
        e.stopPropagation()
        const dimensions = await getImageDimensions(fileToUpload)
        const { width, height } = dimensions
        const skeletonReplacer = this.renderImageSkeleton(height, width)
        const result = await this.uploadImageFile(fileToUpload)
        const imgUrl = result.files[0].url
        const imgName = fileToUpload.name
        this.memorizeImageData(imgUrl, dimensions, imgName)
        imageBlockingStylish.onAction({ width, height, altText: imgName, imgUrl }, skeletonReplacer)
      }
    }
  }

  private async fillImageDimensions(imgDimensions: TImageDimensions) {
    const { width, height } = imgDimensions
    const widthInput = this.addImageModal.querySelector(".NAME-add-image-width-input") as HTMLInputElement
    const heightInput = this.addImageModal.querySelector(".NAME-add-image-height-input") as HTMLInputElement
    widthInput.value = `${width}`
    heightInput.value = `${height}`
  }

  private async onImageFilePicked(e: PointerEvent) {
    e.preventDefault()
    e.stopPropagation()
    const input = e.currentTarget as HTMLInputElement
    const filesList = input.files
    if (filesList && filesList.length > 0) {
      const files = Array.from(filesList)
      if (!this.validateImageFiles(files)) return
      const result = await this.uploadImageFile(files[0])
      this.previewImage(files[0].name, result.files[0].url)
      const dimensions = await getImageDimensions(files[0])
      this.fillImageDimensions(dimensions)
    }
    input.value = ""
    input.files = null
    input.src = ""
  }

  private async onChangeImageURL(e: Event) {
    e.preventDefault()
    e.stopPropagation()
    const input = e.currentTarget as HTMLInputElement
    const url = input.value
    this.previewImage("", url)
    const imgInfo = await CodeVCNEditorService.fetchImageInfo(url)
    this.fillImageDimensions(imgInfo)
  }

  private bindDragAndDropImageEvent() {
    const dropZone = this.addImageModal.querySelector<HTMLElement>(".NAME-add-image-drop-zone")
    if (!dropZone) return

    // Ngăn trình duyệt mở ảnh khi kéo thả
    for (const eventName of ["dragenter", "dragover", "dragleave", "drop"]) {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault()
        e.stopPropagation()
      })
    }

    // Highlight khi kéo file vào
    for (const eventName of ["dragenter", "dragover"]) {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.add("bg-gray-100")
      })
    }

    // Remove highlight khi kéo file ra
    for (const eventName of ["dragleave", "drop"]) {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove("bg-gray-100")
      })
    }

    // Xử lý khi thả file
    dropZone.addEventListener("drop", async (e) => {
      const files = e.dataTransfer?.files || []
      if (files.length === 0) return

      // Ví dụ: chỉ lấy file ảnh
      const images = Array.from(files).filter((file) => this.checkIfImageFile(file))

      if (images.length > 0) {
        // Ở đây bạn có thể upload ảnh hoặc preview
        const fileToUpload = files[0]
        const result = await this.uploadImageFile(fileToUpload)
        this.previewImage(fileToUpload.name, result.files[0].url)
        const dimensions = await getImageDimensions(fileToUpload)
        this.fillImageDimensions(dimensions)
      }
    })
  }

  private onAction(e: PointerEvent) {
    e.preventDefault()
    e.stopPropagation()
    const infoForm = this.addImageModal.querySelector(".NAME-add-image-info-form") as HTMLFormElement
    const formData = new FormData(infoForm)
    const width = parseInt(formData.get("img-width") as string)
    const height = parseInt(formData.get("img-height") as string)
    const imgUrl = formData.get("img-url") as string
    const caption = formData.get("img-caption") as string
    imageBlockingStylish.onAction({ width, height, altText: caption, imgUrl })
  }

  showAddImageModal() {
    ModalManager.showModal<typeof Modal>([
      {
        title: "Add Image",
        bodyLitHTML: html`
          <div class="NAME-add-image-container p-4 space-y-6 h-full">
            <div class="NAME-add-image-type-buttons STATE-upload flex gap-2 bg-gray-100 rounded-xl p-1">
              <button
                @click=${(e: PointerEvent) => this.switchAddImageType(e)}
                class="NAME-add-image-btn-upload flex-1 flex items-center justify-center cursor-pointer gap-2 p-2 leading-none rounded-lg font-medium transition-all duration-300 text-gray-600 hover:bg-white hover:shadow"
              >
                <i class="bi bi-upload font-bold"></i>
                Upload File
              </button>
              <button
                @click=${(e: PointerEvent) => this.switchAddImageType(e)}
                class="NAME-add-image-btn-url flex-1 flex items-center justify-center cursor-pointer gap-2 p-2 leading-none rounded-lg font-medium transition-all duration-300 text-gray-600 hover:bg-white hover:shadow"
              >
                <i class="bi bi-link-45deg font-bold"></i>
                Image URL
              </button>
            </div>

            <div class="NAME-add-image-content STATE-upload space-y-4">
              <input
                @change=${(e: PointerEvent) => this.onImageFilePicked(e)}
                type="file"
                multiple
                accept=".svg,.png,.jpg,.jpeg,.gif"
                hidden
                class="NAME-add-image-upload-input"
              />
              <section
                @click=${(e: PointerEvent) => this.pickImageFile(e)}
                class="NAME-add-image-upload-section NAME-add-image-drop-zone hover:bg-gray-50 border-2 border-dashed rounded-xl p-8 text-center border-gray-400 transition-colors duration-200 cursor-pointer"
              >
                <div class="flex flex-col items-center space-y-4">
                  <div class="p-4 rounded-full bg-gray-100 transition-colors duration-200">
                    <i class="bi bi-camera text-gray-600 text-2xl font-bold"></i>
                  </div>
                  <div>
                    <p class="text-lg font-medium text-black mb-2">Click to upload or drag and drop</p>
                    <p class="text-sm text-gray-600">SVG, PNG, JPG or GIF (max: 10MB)</p>
                  </div>
                  <button
                    @click=${(e: PointerEvent) => this.pickImageFile(e)}
                    class="bg-black text-white px-6 py-1 cursor-pointer rounded-lg hover:scale-105 transition duration-200 font-medium"
                  >
                    Choose File
                  </button>
                </div>
              </section>
              <section class="NAME-add-image-url-section space-y-2">
                <label class="block text-sm pl-1 font-medium text-black">Image URL</label>
                <input
                  type="url"
                  @change=${(e: PointerEvent) => this.onChangeImageURL(e)}
                  placeholder="Example: https://example.com/image.jpg"
                  class="NAME-add-image-url-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                  value=${this.memorizedImage?.imgUrl || ""}
                />
              </section>
            </div>

            <div class="space-y-2">
              <label class="block text-sm pl-1 font-medium text-black">Image Preview</label>
              <div class="border border-gray-300 rounded-lg p-2 bg-gray-100">
                <div class="NAME-add-image-preview flex flex-col items-center justify-center text-gray-500">
                  ${this.memorizedImage
                    ? html` <img src=${this.memorizedImage?.imgUrl || ""} alt=${this.memorizedImage?.caption || ""} /> `
                    : html`<i class="bi bi-image text-4xl font-bold"></i>
                        <p class="text-sm mt-2">No image selected</p>`}
                </div>
              </div>
            </div>

            <form
              action="#"
              @submit=${(e: SubmitEvent) => e.preventDefault()}
              class="NAME-add-image-info-form grid grid-cols-1 md:grid-cols-2 gap-6 pb-4"
            >
              <input hidden name="img-url" class="NAME-add-image-img-url" />
              <div class="space-y-4 grid-rows-2 flex flex-col justify-between">
                <div class="space-y-2">
                  <label class="block text-sm pl-1 font-medium text-black">Width (px)</label>
                  <input
                    type="number"
                    placeholder="800"
                    name="img-width"
                    class="NAME-add-image-width-input w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                    value=${this.memorizedImage?.dimensions.width || ""}
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm pl-1 font-medium text-black">Height (px)</label>
                  <input
                    type="number"
                    placeholder="600"
                    name="img-height"
                    class="NAME-add-image-height-input w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                    value=${this.memorizedImage?.dimensions.height || ""}
                  />
                </div>
              </div>

              <div class="space-y-2 grid-rows-2 flex flex-col">
                <label class="block text-sm pl-1 font-medium text-black">Description</label>
                <textarea
                  placeholder="Enter image caption..."
                  rows="5"
                  name="img-caption"
                  class="w-full grow px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 resize-none"
                >
${this.memorizedImage?.caption || ""}</textarea
                >
              </div>
            </form>
          </div>
        `,
        footerLitHTML: html`
          <div class="flex items-center justify-end gap-3 text-base">
            <button
              @click=${() => ModalManager.hideModal(this.addImageModal)}
              class="px-6 py-1 cursor-pointer text-gray-600 hover:scale-105 transition duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              @click=${(e: PointerEvent) => this.onAction(e)}
              class="px-6 py-1 cursor-pointer bg-black text-white rounded-lg hover:scale-105 transition duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Insert Image
            </button>
          </div>
        `,
      },
    ])
    this.bindDragAndDropImageEvent()
  }
}

export const addImageModalManager = new AddImageModalManager()
