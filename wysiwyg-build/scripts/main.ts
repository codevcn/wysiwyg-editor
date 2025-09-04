import { codevcnEditor } from "./lib/artifact/codevcn-editor.js"

const init = () => {
  codevcnEditor.setContent("<section>Xin chào! Đây là <ins>phần mới</ins> của <b>văn b</b>ản.</section>")
  codevcnEditor.configModule({
    imageModule: {
      uploadImageURL: "http://localhost:3000/api/upload",
    },
  })
}
init()
