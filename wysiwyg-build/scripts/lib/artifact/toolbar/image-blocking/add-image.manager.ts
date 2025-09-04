import { ModalManager } from "@/lib/components/managers/modal.manager"
import { Modal } from "@/lib/components/modal"
import { html } from "lit-html"

class AddImageModalManager {
  private addImageModal: HTMLElement

  constructor() {
    this.addImageModal = this.createAddImageModal()
  }

  private createAddImageModal(): HTMLElement {
    return ModalManager.initModal()
  }

  getAddImageModal(): HTMLElement {
    return this.addImageModal
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

  private previewImage(image: HTMLImageElement) {
    const preview = this.addImageModal.querySelector(".NAME-add-image-preview") as HTMLElement
    preview.appendChild(image)
  }

  private onPickImageFile(e: PointerEvent) {
    e.preventDefault()
    e.stopPropagation()
    const input = e.currentTarget as HTMLInputElement
    const files = input.files
    if (files && files.length > 0) {
    }
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
                @change=${(e: PointerEvent) => this.onPickImageFile(e)}
                type="file"
                multiple
                accept=".svg,.png,.jpg,.jpeg,.gif"
                hidden
                class="NAME-add-image-upload-input"
              />
              <section
                @click=${(e: PointerEvent) => this.pickImageFile(e)}
                class="NAME-add-image-upload-section hover:bg-gray-50 border-2 border-dashed rounded-xl p-8 text-center border-gray-400 transition-colors duration-200 cursor-pointer"
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
                  placeholder="Example: https://example.com/image.jpg"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                />
              </section>
            </div>

            <div class="space-y-2">
              <label class="block text-sm pl-1 font-medium text-black">Preview</label>
              <div class="border border-gray-300 rounded-xl p-8 bg-gray-50">
                <div class="flex flex-col items-center justify-center h-48 text-gray-500">
                  <i class="bi bi-image text-4xl mb-4 font-bold"></i>
                  <p class="text-sm">No image selected</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
              <div class="space-y-4 grid-rows-2 flex flex-col justify-between">
                <div class="space-y-2">
                  <label class="block text-sm pl-1 font-medium text-black">Width (px)</label>
                  <input
                    type="number"
                    placeholder="800"
                    class="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm pl-1 font-medium text-black">Height (px)</label>
                  <input
                    type="number"
                    placeholder="600"
                    class="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div class="space-y-2 grid-rows-2 flex flex-col">
                <label class="block text-sm pl-1 font-medium text-black">Description</label>
                <textarea
                  placeholder="Describe the image for accessibility..."
                  rows="5"
                  class="w-full grow px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 resize-none"
                ></textarea>
              </div>
            </div>
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
              class="px-6 py-1 cursor-pointer bg-black text-white rounded-lg hover:scale-105 transition duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Upload Image
            </button>
          </div>
        `,
      },
    ])
  }
}

export const addImageModalManager = new AddImageModalManager()
