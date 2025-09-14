import type * as State from "@codemirror/state"
import type * as View from "@codemirror/view"
import type * as Language from "@codemirror/language"
import type * as Commands from "@codemirror/commands"
import type * as VSCodeTheme from "@uiw/codemirror-theme-vscode"
import type { javascript } from "@codemirror/lang-javascript"
import type { python } from "@codemirror/lang-python"
import type { cpp } from "@codemirror/lang-cpp"
import type * as Autocomplete from "@codemirror/autocomplete"

export interface ILoadedModules {
  EditorState: typeof State.EditorState
  EditorView: typeof View.EditorView
  keymap: typeof View.keymap
  highlightSpecialChars: typeof View.highlightSpecialChars
  drawSelection: typeof View.drawSelection
  highlightActiveLine: typeof View.highlightActiveLine
  lineNumbers: typeof View.lineNumbers
  defaultHighlightStyle: typeof Language.defaultHighlightStyle
  syntaxHighlighting: typeof Language.syntaxHighlighting
  indentOnInput: typeof Language.indentOnInput
  bracketMatching: typeof Language.bracketMatching
  foldGutter: typeof Language.foldGutter
  foldKeymap: typeof Language.foldKeymap
  history: typeof Commands.history
  historyKeymap: typeof Commands.historyKeymap
  defaultKeymap: typeof Commands.defaultKeymap
  darkTheme: typeof VSCodeTheme.vscodeDark
  lightTheme: typeof VSCodeTheme.vscodeLight
  javascript: typeof javascript
  python: typeof python
  cpp: typeof cpp
  closeBrackets: typeof Autocomplete.closeBrackets
  closeBracketsKeymap: typeof Autocomplete.closeBracketsKeymap
  undo: typeof Commands.undo
  redo: typeof Commands.redo
}
