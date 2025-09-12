import { ECodeBlockingLanguage, EErrorMessage } from "@/enums/global-enums"
import { cpp } from "@codemirror/lang-cpp"
import type { ILoadedModules } from "@/types/global-interfaces"
import { CodeVCNEditorHelper } from "@/helpers/codevcn-editor-helper"
import { EditorInternalErrorHelper } from "@/helpers/error-helper"
import type { TSkeletonReplacer } from "@/types/global-types"
import type { EditorState } from "@codemirror/state"
import { LitHTMLHelper } from "@/helpers/common-helpers"
import { Skeleton } from "@/lib/components/skeleton"

type TCodeBlockName = `code-block-name-${string}`

type TCodeBlockView = InstanceType<ILoadedModules["EditorView"]>

type TInitCodeBlockViewResult = {
  codeBlockView: TCodeBlockView
  codeBlockElement: HTMLElement
}

type TLoadScriptsResult = TInitCodeBlockViewResult

class CodeBlockingManager {
  private readonly codeBlockContainerElementTagName: string = "DIV"
  private loadedModules: ILoadedModules | null = null
  private savedCodeBlocks: Map<TCodeBlockName, TCodeBlockView> = new Map()
  private readonly codeBlockClassName: string = "NAME-code-block"

  constructor() {}

  private async loadModulesOnce(): Promise<ILoadedModules> {
    if (this.loadedModules) return this.loadedModules

    const [
      { EditorState },
      { EditorView, keymap, highlightSpecialChars, drawSelection, highlightActiveLine, lineNumbers },
      { defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching, foldGutter, foldKeymap },
      { history, historyKeymap, defaultKeymap },
      { oneDark },
      { javascript },
      { python },
    ] = await Promise.all([
      import("@codemirror/state"),
      import("@codemirror/view"),
      import("@codemirror/language"),
      import("@codemirror/commands"),
      import("@codemirror/theme-one-dark"),
      import("@codemirror/lang-javascript"),
      import("@codemirror/lang-python"),
    ])

    this.loadedModules = {
      EditorState,
      EditorView,
      keymap,
      highlightSpecialChars,
      drawSelection,
      highlightActiveLine,
      lineNumbers,
      defaultHighlightStyle,
      syntaxHighlighting,
      indentOnInput,
      bracketMatching,
      foldGutter,
      foldKeymap,
      history,
      historyKeymap,
      defaultKeymap,
      oneDark,
      javascript,
      python,
      cpp,
    }

    return this.loadedModules
  }

  private async loadScripts(language: ECodeBlockingLanguage, isDarkTheme = false): Promise<TLoadScriptsResult> {
    const {
      EditorState,
      EditorView,
      keymap,
      highlightSpecialChars,
      drawSelection,
      highlightActiveLine,
      lineNumbers,
      defaultHighlightStyle,
      syntaxHighlighting,
      indentOnInput,
      bracketMatching,
      foldGutter,
      foldKeymap,
      history,
      historyKeymap,
      defaultKeymap,
      oneDark,
      javascript,
      python,
      cpp,
    } = await this.loadModulesOnce()

    const languages = {
      javascript: javascript(),
      cpp: cpp(),
      python: python(),
    }

    const lightTheme = EditorView.theme({}, { dark: false })

    const startState = EditorState.create({
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
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap]),
        languages[language],
        isDarkTheme ? oneDark : lightTheme,
      ],
    })

    return this.initCodeBlockView(startState)
  }

  private initEnvironment(language: ECodeBlockingLanguage, isDarkTheme = false): Promise<TLoadScriptsResult> {
    return this.loadScripts(language, isDarkTheme)
  }

  private saveNewCodeBlock(codeBlockName: TCodeBlockName, codeBlock: TCodeBlockView) {
    this.savedCodeBlocks.set(codeBlockName, codeBlock)
  }

  private createCodeBlockName(): string {
    return "code-block-name-" + crypto.randomUUID()
  }

  private createNewCodeBlockContainerElement(): HTMLElement {
    const codeBlock = document.createElement(this.codeBlockContainerElementTagName)
    codeBlock.className = this.codeBlockClassName
    codeBlock.dataset.codeBlockName = this.createCodeBlockName()
    return codeBlock
  }

  private createCodeBlockSkeleton(): HTMLElement {
    return LitHTMLHelper.createFromRenderer(Skeleton, [{ fullWidth: true, height: 200 }])
  }

  private insertCodeBlockSkeleton(selection: Selection): TSkeletonReplacer {
    const skeleton = CodeVCNEditorHelper.insertElementAtCaret(this.createCodeBlockSkeleton(), selection)
    if (!skeleton) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.INSERT_CODE_BLOCK_SKELETON_FAILED)
    }
    return (codeBlockElement: HTMLElement) => {
      skeleton.replaceWith(codeBlockElement)
    }
  }

  private initCodeBlockView(startState: EditorState): TInitCodeBlockViewResult {
    if (!this.loadedModules) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.LOADED_CODE_BLOCK_MODULES_NOT_FOUND)
    }
    const codeBlockElement = this.createNewCodeBlockContainerElement()
    const codeBlockView = new this.loadedModules.EditorView({
      state: startState,
      parent: codeBlockElement,
    })
    this.saveNewCodeBlock(codeBlockElement.dataset.codeBlockName as TCodeBlockName, codeBlockView)
    return { codeBlockView, codeBlockElement }
  }

  insertCodeBlockForEditing(language: ECodeBlockingLanguage = ECodeBlockingLanguage.CPP, isDarkTheme = false) {
    const selection = CodeVCNEditorHelper.restoreCaretPosition()
    if (!selection) {
      throw EditorInternalErrorHelper.createError(EErrorMessage.SELECTION_NOT_FOUND)
    }
    CodeVCNEditorHelper.splitCurrentTopBlockElementAtCaret(selection, true)
    const skeletonReplacer = this.insertCodeBlockSkeleton(selection)
    this.initEnvironment(language, isDarkTheme).then(({ codeBlockElement }) => {
      // skeletonReplacer(codeBlockElement)
    })
  }
}

export const codeBlockingManager = new CodeBlockingManager()
