import { EditorState } from "@codemirror/state"
import {
  EditorView,
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  lineNumbers,
} from "@codemirror/view"
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
} from "@codemirror/language"
import { history, historyKeymap, defaultKeymap } from "@codemirror/commands"
import { oneDark } from "@codemirror/theme-one-dark"

import { javascript } from "@codemirror/lang-javascript"
import { cpp } from "@codemirror/lang-cpp"
import { python } from "@codemirror/lang-python"

// ---- Theme sáng
const lightTheme = EditorView.theme({}, { dark: false })

// ---- Ngôn ngữ hỗ trợ
const languages = {
  javascript: javascript(),
  cpp: cpp(),
  python: python(),
}

// ---- Tạo Editor
function createEditor(parent: HTMLElement, language: keyof typeof languages, isDark = false) {
  const startState = EditorState.create({
    doc: `// Viết code ${language} ở đây...\nfunction test() {\n  console.log("hello");\n}`,
    extensions: [
      lineNumbers(), // hiển thị số dòng
      foldGutter(), // gutter cho collapse code
      highlightSpecialChars(),
      history(),
      drawSelection(),
      indentOnInput(),
      bracketMatching(),
      highlightActiveLine(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap]), // keymap hỗ trợ folding
      languages[language],
      isDark ? oneDark : lightTheme,
    ],
  })

  const view = new EditorView({
    state: startState,
    parent: parent,
  })

  return view
}

// ---- Xuất code thành Markdown
function toMarkdown(view: EditorView, language: keyof typeof languages): string {
  const code = view.state.doc.toString()
  return `\`\`\`${language}\n${code}\n\`\`\``
}

// ---- Ví dụ dùng
const editorContainer = document.getElementById("editor")!
let currentThemeDark = false
let currentLanguage: keyof typeof languages = "javascript"

let editor = createEditor(editorContainer, currentLanguage, currentThemeDark)

// ---- Nút chuyển theme
document.getElementById("toggleTheme")?.addEventListener("click", () => {
  currentThemeDark = !currentThemeDark
  editor.destroy()
  editor = createEditor(editorContainer, currentLanguage, currentThemeDark)
})

// ---- Nút đổi ngôn ngữ
document.getElementById("setLangJs")?.addEventListener("click", () => {
  currentLanguage = "javascript"
  editor.destroy()
  editor = createEditor(editorContainer, currentLanguage, currentThemeDark)
})
document.getElementById("setLangCpp")?.addEventListener("click", () => {
  currentLanguage = "cpp"
  editor.destroy()
  editor = createEditor(editorContainer, currentLanguage, currentThemeDark)
})
document.getElementById("setLangPy")?.addEventListener("click", () => {
  currentLanguage = "python"
  editor.destroy()
  editor = createEditor(editorContainer, currentLanguage, currentThemeDark)
})

// ---- Nút export Markdown
document.getElementById("exportMd")?.addEventListener("click", () => {
  const md = toMarkdown(editor, currentLanguage)
  console.log(md)
})
