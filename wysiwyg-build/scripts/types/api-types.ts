export type TUploadImageRes = {
  message: string
  files: {
    filename: string
    url: string
  }[]
}

export type TImageInfoRes = {
  width: number
  height: number
}
