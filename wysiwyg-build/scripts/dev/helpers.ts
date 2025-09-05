export const measureTime = (fn: () => void, label: string = "Anonymous") => {
  const startTime = performance.now()
  fn()
  const endTime = performance.now()
  console.log(`>>> [${label}] Time taken: ${endTime - startTime} milliseconds`)
}

export const logRangeFragment = (label: string, frag: DocumentFragment) => {
  const div = document.createElement("div")
  div.appendChild(frag)
  console.log(label, div.innerHTML)
}

export const logRangeContents = (label: string, range: Range) => {
  const frag = range.cloneContents()
  logRangeFragment(label, frag)
}

export const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
