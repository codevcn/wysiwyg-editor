import { codevcnEditor } from "./lib/artifacts/codevcn-editor/codevcn-editor.js"
import { LayoutHelper } from "./utils/helpers.js"

const init = () => {
  codevcnEditor.setContent("<p>Xin chào! Đây là <ins>phần mới</ins> của <b>văn b</b>ản.</p>")
  LayoutHelper.onClickOnPageBody((e) => {
    const target = e.target as HTMLElement
  })
}
init()
