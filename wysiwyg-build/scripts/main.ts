import { codevcnEditor } from "./lib/artifact/codevcn-editor.js"

const init = () => {
  codevcnEditor.setContent(`
    <section>Xin chào! Đây là <ins>phần mới</ins> của <b>văn b</b>ản.</section>
    <section>Bản án <p>thật nặng.</p></section>
    <section>vayla123 còn nhẹ ch<b>án</b></section>
    <section><a href='https://www.google.com/' target='_blank' rel='noopener noreferrer'>Google</a></section>
  `)
  codevcnEditor.configModule({
    imageModule: {
      uploadImageURL: "http://localhost:3000/api/upload",
    },
  })
}
init()
