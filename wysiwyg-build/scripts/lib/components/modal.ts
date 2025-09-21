import { html, type TemplateResult } from "lit-html"

type ModalProps = {
  body: TemplateResult<1>
} & Partial<{
  title: string
  footer: TemplateResult<1>
}>

export const Modal = ({ body, title, footer }: ModalProps): TemplateResult<1> => {
  return html`
    <div class="NAME-modal fixed inset-0 flex items-center justify-center p-4 z-[100] text-base">
      <div class="NAME-modal-overlay bg-black/50 absolute inset-0 z-10"></div>
      <div
        class="NAME-modal-content flex flex-col bg-white rounded-2xl shadow-2xl w-full h-fit max-h-full max-w-[70vw] overflow-hidden relative z-11"
      >
        <div class="NAME-modal-header flex items-center justify-between p-2 border-b border-gray-200">
          <h2 class="NAME-modal-title ml-3 text-xl font-bold text-black">${title}</h2>
          <button
            class="NAME-modal-close p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <i class="bi bi-x-lg text-gray-600 text-xl"></i>
          </button>
        </div>
        <div class="NAME-modal-body flex flex-col grow overflow-y-auto h-fit">${body}</div>
        <div class="NAME-modal-footer w-full border-t border-gray-200 py-2 px-4 bg-white">${footer}</div>
      </div>
    </div>
  `
}
