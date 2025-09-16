import type { TSkeletonReplacer } from "@/types/global-types.js"
import { capitalizeWord, LitHTMLHelper } from "@/helpers/common-helpers.js"
import { Skeleton } from "@/lib/components/skeleton.js"
import type { Extension } from "@codemirror/state"
import { Compartment, EditorState } from "@codemirror/state"
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
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete"
import { history, historyKeymap, defaultKeymap, indentWithTab, undo, redo } from "@codemirror/commands"
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { cpp } from "@codemirror/lang-cpp"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper.js"
import { EditorInternalErrorHelper } from "@/helpers/error-helper.js"
import { ECodeBlockingLanguage, EErrorMessage } from "@/enums/global-enums.js"
import { html } from "lit-html"
import { DropdownManager } from "@/lib/components/managers/dropdown.manager.js"
import { codeBlockingStylish } from "./code-blocking.stylish.js"

type TCodeBlockView = EditorView

type TInitCodeBlockViewResult = {
  codeBlockView: TCodeBlockView
  boxElement: HTMLElement
  parentElement: HTMLElement
}

type TCodeBlockName = `name-${string}`

type TCreateCodeBlockBoxElementResult = {
  boxElement: HTMLElement
  parentElement: HTMLElement
}

type TCompartments = {
  languageCompartment: Compartment
  themeCompartment: Compartment
}

export class CodeBlockViewManager {
  private savedCodeBlocks: Map<TCodeBlockName, TCodeBlockView> = new Map()
  private languageCompartment: Compartment | null = null
  private themeCompartment: Compartment | null = null

  constructor(private readonly codeBlockBoxElementTagName: string, private readonly codeBlockBoxClassName: string) {}

  private initCompartments(): TCompartments {
    this.languageCompartment = this.languageCompartment || new Compartment()
    this.themeCompartment = this.themeCompartment || new Compartment()
    return {
      languageCompartment: this.languageCompartment,
      themeCompartment: this.themeCompartment,
    }
  }

  private async getLanguageExtension(language: ECodeBlockingLanguage): Promise<Extension> {
    if (language === ECodeBlockingLanguage.JAVASCRIPT) {
      return javascript()
    }
    if (language === ECodeBlockingLanguage.PYTHON) {
      return python()
    }
    return cpp()
  }

  private createCodeBlockName(): TCodeBlockName {
    return `name-${crypto.randomUUID()}`
  }

  private saveNewCodeBlock(codeBlockName: TCodeBlockName, codeBlock: TCodeBlockView) {
    this.savedCodeBlocks.set(codeBlockName, codeBlock)
  }

  private switchTheme(e: MouseEvent) {
    const themeCompartment = this.themeCompartment
    if (!themeCompartment) return
    const btn = e.currentTarget as HTMLElement
    const codeBlockBox = btn.closest(`.${this.codeBlockBoxClassName}`) as HTMLElement
    const isDarkTheme = codeBlockBox.dataset.isDarkTheme === "true"
    if (isDarkTheme) {
      codeBlockBox.dataset.isDarkTheme = "false"
      const view = this.savedCodeBlocks.get(codeBlockBox.dataset.codeBlockBoxName as TCodeBlockName)
      if (view) {
        view.dispatch({
          effects: themeCompartment.reconfigure(vscodeLight),
        })
        const themeLabel = btn.querySelector(".NAME-theme-label")
        if (themeLabel) {
          themeLabel.innerHTML = `<i class="bi bi-sun-fill"></i>`
        }
      }
    } else {
      codeBlockBox.dataset.isDarkTheme = "true"
      const view = this.savedCodeBlocks.get(codeBlockBox.dataset.codeBlockBoxName as TCodeBlockName)
      if (view) {
        view.dispatch({
          effects: themeCompartment.reconfigure(vscodeDark),
        })
        const themeLabel = btn.querySelector(".NAME-theme-label")
        if (themeLabel) {
          themeLabel.innerHTML = `<i class="bi bi-moon-fill"></i>`
        }
      }
    }
  }

  private switchLanguage(trigger: HTMLElement, language: ECodeBlockingLanguage) {
    this.getLanguageExtension(language).then((languageExtension) => {
      const languageCompartment = this.languageCompartment
      if (!languageCompartment) return
      const codeBlockBox = trigger.closest<HTMLElement>(`.${this.codeBlockBoxClassName}`)
      if (!codeBlockBox) return
      const view = this.savedCodeBlocks.get(codeBlockBox.dataset.codeBlockBoxName as TCodeBlockName)
      if (!view) return
      view.dispatch({
        effects: languageCompartment.reconfigure(languageExtension),
      })
      const languageLabel = trigger.querySelector(".NAME-language-label")
      if (languageLabel) {
        languageLabel.textContent = capitalizeWord(language)
      }
    })
  }

  private onClickButtonSwitchLanguage(e: MouseEvent) {
    const currentTarget = e.currentTarget as HTMLElement
    DropdownManager.onTriggerClick(
      currentTarget,
      [
        {
          options: Object.values(ECodeBlockingLanguage).map((language) => ({
            value: language,
            label: capitalizeWord(language),
            className: "text-sm",
          })),
        },
      ],
      (activeValue) => {
        this.switchLanguage(currentTarget, activeValue as ECodeBlockingLanguage)
      }
    )
  }

  private onClickButtonUndoRedo(e: MouseEvent, action: "undo" | "redo") {
    const currentTarget = e.currentTarget as HTMLElement
    const codeBlockBox = currentTarget.closest<HTMLElement>(`.${this.codeBlockBoxClassName}`)
    if (!codeBlockBox) return
    const view = this.savedCodeBlocks.get(codeBlockBox.dataset.codeBlockBoxName as TCodeBlockName)
    if (!view) return
    if (action === "undo") {
      undo(view)
    } else {
      redo(view)
    }
  }

  private createNewCodeBlockBoxElement(
    language: ECodeBlockingLanguage,
    isDarkTheme: boolean
  ): TCreateCodeBlockBoxElementResult {
    const parentElement = document.createElement(this.codeBlockBoxElementTagName)

    const boxElement = document.createElement(this.codeBlockBoxElementTagName)
    boxElement.contentEditable = "false"
    boxElement.className = this.codeBlockBoxClassName + " border border-regular-border-cl rounded overflow-hidden"
    boxElement.dataset.codeBlockBoxName = this.createCodeBlockName()
    boxElement.dataset.language = language
    boxElement.dataset.isDarkTheme = isDarkTheme.toString()
    boxElement.appendChild(
      LitHTMLHelper.createElementFromRenderer(
        () => html`
          <div class="flex gap-2 items-stretch justify-between w-full py-1 px-2 text-sm">
            <div class="flex gap-2 items-stretch">
              <button
                @click=${(e: MouseEvent) => this.switchTheme(e)}
                class="flex items-center gap-2 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"
              >
                <span class="NAME-theme-label"
                  >${isDarkTheme ? html`<i class="bi bi-moon-fill"></i>` : html`<i class="bi bi-sun-fill"></i>`}</span
                >
              </button>
              <button
                @click=${(e: MouseEvent) => this.onClickButtonSwitchLanguage(e)}
                class="NAME-dropdown-trigger flex items-center gap-2 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"
              >
                <i class="bi bi-braces"></i>
                <span class="NAME-language-label">${capitalizeWord(language)}</span>
              </button>
            </div>
            <div class="flex gap-2 items-stretch">
              <button
                @click=${(e: MouseEvent) => this.onClickButtonUndoRedo(e, "undo")}
                class="flex items-center gap-2 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"
              >
                <i class="bi bi-arrow-counterclockwise"></i>
                <span>Undo</span>
              </button>
              <button
                @click=${(e: MouseEvent) => this.onClickButtonUndoRedo(e, "redo")}
                class="flex items-center gap-2 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"
              >
                <i class="bi bi-arrow-clockwise"></i>
                <span>Redo</span>
              </button>
            </div>
          </div>
        `,
        []
      )
    )
    boxElement.appendChild(parentElement)

    return {
      boxElement,
      parentElement,
    }
  }

  private handleArroyKeys(view: EditorView, direction: "up" | "down" | "left" | "right"): boolean {
    const state = view.state
    const stateDoc = state.doc
    const totalLines = stateDoc.lines
    const cursorPos = state.selection.main.head
    const currentLine = stateDoc.lineAt(cursorPos).number
    if (direction === "up" && currentLine === 1) {
      codeBlockingStylish.jumpToPreviousLineFromInsideCodeBlock(view.dom)
      return true
    } else if (direction === "down" && currentLine === totalLines) {
      codeBlockingStylish.jumpToNewLineFromInsideCodeBlock(view.dom)
      return true
    } else {
      const firstLine = stateDoc.line(1) // dòng đầu
      const lastLine = stateDoc.line(totalLines) // dòng cuối
      // Trường hợp 1: con trỏ ở đầu dòng đầu tiên
      if (direction === "left" && cursorPos === firstLine.from) {
        codeBlockingStylish.jumpToPreviousLineFromInsideCodeBlock(view.dom)
        return true
      }
      // Trường hợp 2: con trỏ ở cuối dòng cuối cùng
      if (direction === "right" && cursorPos === lastLine.to) {
        codeBlockingStylish.jumpToNewLineFromInsideCodeBlock(view.dom)
        return true
      }
    }
    return false
  }

  private initDOMEventHandlers(): Extension {
    return EditorView.domEventHandlers({
      keydown: (e, view) => {
        e.stopPropagation()
        return false
      },
      beforeinput: (e, view) => {
        e.stopPropagation()
        return false
      },
      click: (e, view) => {
        e.stopPropagation()
        return false
      },
      selectionchange: (e, view) => {
        e.stopPropagation()
        e.preventDefault()
        return false
      },
      paste: (e, view) => {
        e.stopPropagation()
        return false
      },
      input: (e, view) => {
        e.stopPropagation()
        return false
      },
    })
  }

  private createCodeBlockSkeleton(): HTMLElement {
    return LitHTMLHelper.createElementFromRenderer(Skeleton, [{ fullWidth: true, height: 200 }])
  }

  private insertCodeBlockSkeleton(selection: Selection): TSkeletonReplacer {
    const skeleton = this.createCodeBlockSkeleton()
    const topBlockElement = CodeVCNEditorHelper.getTopBlockElementFromSelection(selection)
    if (!topBlockElement) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.TOP_BLOCK_NOT_FOUND)
    }
    topBlockElement.replaceChildren(skeleton)
    return (codeBlockElement: HTMLElement) => {
      skeleton.replaceWith(codeBlockElement)
    }
  }

  private async generateStartState(language: ECodeBlockingLanguage, isDarkTheme: boolean): Promise<EditorState> {
    const { languageCompartment, themeCompartment } = this.initCompartments()

    const languageExtension = languageCompartment.of(await this.getLanguageExtension(language))

    const themeExtension = themeCompartment.of(isDarkTheme ? vscodeDark : vscodeLight)

    return EditorState.create({
      doc: "",
      extensions: [
        lineNumbers(),
        foldGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        highlightActiveLine(),
        closeBrackets(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([
          { key: "ArrowDown", run: (view) => this.handleArroyKeys(view, "down") },
          { key: "ArrowUp", run: (view) => this.handleArroyKeys(view, "up") },
          { key: "ArrowLeft", run: (view) => this.handleArroyKeys(view, "left") },
          { key: "ArrowRight", run: (view) => this.handleArroyKeys(view, "right") },
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap,
          indentWithTab,
          ...closeBracketsKeymap,
        ]),
        languageExtension,
        themeExtension,
        this.initDOMEventHandlers(),
      ],
    })
  }

  async initCodeBlockView(
    selection: Selection,
    language: ECodeBlockingLanguage,
    isDarkTheme: boolean = false
  ): Promise<TInitCodeBlockViewResult> {
    const skeletonReplacer = this.insertCodeBlockSkeleton(selection)

    const { boxElement, parentElement } = this.createNewCodeBlockBoxElement(language, isDarkTheme)
    skeletonReplacer(boxElement)

    const startState = await this.generateStartState(language, isDarkTheme)

    const codeBlockView = new EditorView({
      state: startState,
      parent: parentElement,
    })
    codeBlockView.focus()

    this.saveNewCodeBlock(boxElement.dataset.codeBlockBoxName as TCodeBlockName, codeBlockView)

    return { codeBlockView, boxElement, parentElement }
  }
}
